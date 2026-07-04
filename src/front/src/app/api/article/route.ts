// Détail d'un article chargé à la demande : historique des amendements +
// influenceurs. Sorti du payload initial de la page loi (qui pesait ~3 Mo) —
// voir getProjetLoi / getArticleDetail dans src/lib/data.ts.

import { getArticleDetail } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dossier = searchParams.get("dossier")?.trim();
  const numero = searchParams.get("numero")?.trim();

  if (!dossier || !numero) {
    return Response.json(
      { error: "Paramètres 'dossier' et 'numero' requis." },
      { status: 400 }
    );
  }

  const detail = await getArticleDetail(dossier, numero);
  if (!detail) {
    return Response.json({ error: "Dossier introuvable." }, { status: 404 });
  }

  return Response.json(detail);
}
