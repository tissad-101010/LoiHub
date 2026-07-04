// Endpoint de recherche : GET /api/search?q=...
// Interroge les 3 index Meilisearch en une seule requête (multiSearch) et
// renvoie des résultats groupés par catégorie : dossiers / amendements / députés.

import { NextResponse } from "next/server";
import { meili, INDEX, type DossierDoc, type AmendementDoc, type DeputeDoc } from "@/lib/meili";

export const dynamic = "force-dynamic";

export interface SearchResponse {
  query: string;
  dossiers: DossierDoc[];
  amendements: AmendementDoc[];
  deputes: DeputeDoc[];
}

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();

  const empty: SearchResponse = { query: q, dossiers: [], amendements: [], deputes: [] };
  if (!q) return NextResponse.json(empty);

  try {
    const { results } = await meili.multiSearch({
      queries: [
        { indexUid: INDEX.dossiers, q, limit: 5 },
        { indexUid: INDEX.amendements, q, limit: 6, attributesToHighlight: ["extrait"] },
        { indexUid: INDEX.deputes, q, limit: 5 },
      ],
    });

    // multiSearch renvoie les résultats dans l'ordre des queries.
    const [dossiers, amendements, deputes] = results;
    return NextResponse.json({
      query: q,
      dossiers: dossiers.hits as DossierDoc[],
      amendements: amendements.hits as AmendementDoc[],
      deputes: deputes.hits as DeputeDoc[],
    } satisfies SearchResponse);
  } catch (e) {
    // Recherche indisponible (index pas encore construit, Meili down…) -> réponse vide,
    // le front dégrade proprement au lieu de planter.
    console.error("[/api/search] échec :", e);
    return NextResponse.json(empty, { status: 200 });
  }
}
