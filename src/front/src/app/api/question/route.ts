// Route serveur : Q&R citoyenne sur une loi, via l'API Mistral.
//
// Anti-hallucination : le modèle reçoit UNIQUEMENT le contexte reconstruit
// depuis la base (titre, statut, parcours, stats, scrutins, articles amendés)
// et la consigne stricte de ne répondre qu'à partir de ce contexte — s'il ne
// sait pas, il doit le dire et renvoyer vers le dossier officiel.

import { getProjetLoi } from "@/lib/data";

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
const MODELE = "mistral-small-latest";

const MAX_QUESTION = 500;
const MAX_CONTEXTE = 16000;

// cache mémoire process : (dossier, question normalisée) -> réponse
const cache = new Map<string, string>();

function construireContexte(p: NonNullable<Awaited<ReturnType<typeof getProjetLoi>>>): string {
  const lignes: string[] = [
    `Titre du texte : ${p.titre}`,
    `Statut : ${p.statut}`,
    p.dateDepot && `Déposé le : ${p.dateDepot}`,
    p.datePromulgation && `Promulgué le : ${p.datePromulgation}`,
    p.loiPromulguee && `Loi promulguée : n° ${p.loiPromulguee.numero}${p.loiPromulguee.date ? ` du ${p.loiPromulguee.date}` : ""}`,
    `Statistiques : ${p.stats.amendements} amendements déposés dont ${p.stats.amendementsAdoptes} adoptés, ` +
      `${p.stats.deputesImpliques} députés impliqués, ${p.stats.votes} scrutins publics, ` +
      `${p.stats.articlesAmendes} articles visés par au moins un amendement.`,
    "",
    "Parcours législatif :",
    ...p.parcours.map((e) => `- ${e.label}${e.date ? ` (${e.date})` : ""}`),
  ].filter(Boolean) as string[];

  if (p.repartitionGroupes.length) {
    lignes.push("", "Amendements par groupe politique (déposés · adoptés) :");
    for (const g of p.repartitionGroupes.slice(0, 15))
      lignes.push(`- ${g.libelle} (${g.groupe}) : ${g.total} · ${g.adoptes}`);
  }

  if (p.scrutins.length) {
    lignes.push("", `Scrutins publics (${p.scrutins.length}) — les 10 derniers :`);
    for (const s of p.scrutins.slice(-10))
      lignes.push(`- ${s.date} : ${s.titre} → ${s.adopte ? "adopté" : "rejeté"} (${s.pour} pour, ${s.contre} contre, ${s.abstention} abstentions)`);
  }

  if (p.articles.length) {
    lignes.push("", "Extraits des articles amendés :");
    for (const a of p.articles) {
      const texte = (a.texte ?? "").slice(0, 600);
      lignes.push(`— ${a.titre} : ${texte}`);
      if (lignes.join("\n").length > MAX_CONTEXTE) break;
    }
  }

  return lignes.join("\n").slice(0, MAX_CONTEXTE);
}

export async function POST(request: Request) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "La question à l'IA n'est pas activée sur ce déploiement." },
      { status: 503 }
    );
  }

  let body: { dossier?: unknown; question?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const dossier = typeof body.dossier === "string" ? body.dossier.trim() : "";
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!dossier || question.length < 5) {
    return Response.json({ error: "Question trop courte." }, { status: 400 });
  }
  if (question.length > MAX_QUESTION) {
    return Response.json({ error: `Question trop longue (max ${MAX_QUESTION} caractères).` }, { status: 400 });
  }

  const cacheKey = `${dossier}::${question.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) return Response.json({ reponse: cached, cache: true });

  const projet = await getProjetLoi(dossier);
  if (!projet) return Response.json({ error: "Dossier introuvable." }, { status: 404 });

  const contexte = construireContexte(projet);

  try {
    const res = await fetch(MISTRAL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODELE,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "Tu aides des citoyens à comprendre un texte de loi français. Tu reçois un CONTEXTE " +
              "(données officielles de l'Assemblée nationale) et une QUESTION. Règles strictes : " +
              "1) Réponds UNIQUEMENT à partir du contexte fourni, en français simple, en 2 à 6 phrases. " +
              "2) Si la réponse ne figure pas dans le contexte, dis-le clairement et invite à consulter " +
              "le dossier officiel sur assemblee-nationale.fr — n'invente JAMAIS. " +
              "3) Reste neutre : ne donne aucune opinion politique, ne juge pas le fond du texte. " +
              "4) Si la question est sans rapport avec ce texte de loi ou le travail parlementaire, " +
              "réponds que tu ne peux répondre qu'aux questions sur ce texte.",
          },
          { role: "user", content: `CONTEXTE :\n${contexte}\n\nQUESTION : ${question}` },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return Response.json(
        { error: `Erreur Mistral (${res.status}).`, detail: detail.slice(0, 500) },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reponse: string | undefined = data?.choices?.[0]?.message?.content?.trim();
    if (!reponse) return Response.json({ error: "Réponse vide." }, { status: 502 });

    cache.set(cacheKey, reponse);
    return Response.json({ reponse });
  } catch (e) {
    return Response.json(
      { error: "Appel à Mistral impossible.", detail: String(e).slice(0, 200) },
      { status: 502 }
    );
  }
}
