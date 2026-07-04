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

export async function POST(request: Request) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "MISTRAL_API_KEY absente côté serveur." },
      { status: 500 }
    );
  }

  let body: { texte?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const texte = typeof body.texte === "string" ? body.texte.trim() : "";
  if (texte.length < MIN_LONGUEUR) {
    return Response.json(
      { error: "Texte trop court pour être résumé." },
      { status: 400 }
    );
  }

  const cached = cache.get(texte);
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
          {
            role: "system",
            content:
              "Tu es un assistant juridique. Résume l'article de loi fourni en français, " +
              "de façon claire et neutre, en 3 à 5 phrases. Va à l'essentiel : ce que " +
              "l'article prévoit et pour qui. N'invente rien qui ne figure pas dans le texte.",
          },
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

    cache.set(texte, resume);
    return Response.json({ resume });
  } catch (e) {
    return Response.json(
      { error: "Appel à Mistral impossible.", detail: String(e).slice(0, 200) },
      { status: 502 }
    );
  }
}
