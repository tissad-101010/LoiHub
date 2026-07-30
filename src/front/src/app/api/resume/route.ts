// Route serveur : résumé IA d'un article de loi via l'API Mistral.
//
// La clé MISTRAL_API_KEY reste côté serveur (jamais exposée au client).
// Anti-flood : l'appel n'a lieu qu'au clic sur le bouton (côté client), et on
// ajoute ici un cache mémoire (par texte) pour ne pas rappeler Mistral deux fois
// pour le même article, plus un plafond de longueur.

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
const MODELE = "mistral-small-latest";

// bornes de sécurité
const MIN_LONGUEUR = 80; // en-dessous, rien d'utile à résumer
const MAX_LONGUEUR = 12000; // on tronque au-delà (coût / limites de contexte)

// cache mémoire process (vidé à chaque redémarrage) : texte -> résumé
const cache = new Map<string, string>();

// Prompt adapté au type de contenu (article de loi ou amendement).
const PROMPTS = {
  article:
    "Tu es un assistant juridique. Résume l'article de loi fourni en français, " +
    "de façon claire et neutre, en 3 à 5 phrases. Va à l'essentiel : ce que " +
    "l'article prévoit et pour qui. N'invente rien qui ne figure pas dans le texte.",
  amendement:
    "Tu es un assistant juridique. On te fournit un amendement parlementaire " +
    "(son dispositif, et éventuellement l'exposé des motifs de son auteur). " +
    "Résume en français, de façon claire et neutre, en 2 à 4 phrases : ce que " +
    "l'amendement change concrètement dans le texte, et pourquoi son auteur le " +
    "propose si l'exposé des motifs l'indique. N'invente rien qui ne figure pas " +
    "dans le texte fourni.",
} as const;

export async function POST(request: Request) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    // 503 (et non 500) : déploiement sans clé Mistral -> le bouton côté client
    // se masque proprement au lieu d'afficher une erreur technique.
    return Response.json(
      { error: "Le résumé par IA n'est pas activé sur ce déploiement." },
      { status: 503 }
    );
  }

  let body: { texte?: unknown; type?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const type = body.type === "amendement" ? "amendement" : "article";
  const texte = typeof body.texte === "string" ? body.texte.trim() : "";
  if (texte.length < MIN_LONGUEUR) {
    return Response.json(
      { error: "Texte trop court pour être résumé." },
      { status: 400 }
    );
  }

  const cacheKey = `${type}:${texte}`;
  const cached = cache.get(cacheKey);
  if (cached) return Response.json({ resume: cached, cache: true });

  const contenu = texte.slice(0, MAX_LONGUEUR);

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
          { role: "system", content: PROMPTS[type] },
          { role: "user", content: contenu },
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
    const resume: string | undefined = data?.choices?.[0]?.message?.content?.trim();
    if (!resume) {
      return Response.json({ error: "Réponse Mistral vide." }, { status: 502 });
    }

    cache.set(cacheKey, resume);
    return Response.json({ resume });
  } catch (e) {
    return Response.json(
      { error: "Appel à Mistral impossible.", detail: String(e).slice(0, 200) },
      { status: 502 }
    );
  }
}
