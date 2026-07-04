// Client Meilisearch partagé (script d'indexation + endpoint de recherche).
// Une seule source de vérité pour l'URL du serveur, les UID d'index et leurs settings.

import { Meilisearch, type Settings } from "meilisearch";

const HOST = process.env.MEILI_HOST ?? "http://localhost:7700";
const API_KEY = process.env.MEILI_MASTER_KEY ?? "loihub-dev-master-key";

// Réutilise l'instance en dev (hot-reload Next) pour éviter d'ouvrir 1 client par requête.
const globalForMeili = globalThis as unknown as { meili?: Meilisearch };
export const meili =
  globalForMeili.meili ?? new Meilisearch({ host: HOST, apiKey: API_KEY });
if (process.env.NODE_ENV !== "production") globalForMeili.meili = meili;

// UID des index. Un index par type d'entité -> multiSearch les interroge en parallèle.
export const INDEX = {
  dossiers: "dossiers",
  amendements: "amendements",
  deputes: "deputes",
} as const;

// ---- Formes des documents indexés (ce que renvoie la recherche au front) ----

export interface DossierDoc {
  id: string; // uid AN (sert d'URL /loi/[id])
  titre: string;
  amendements: number;
  adoptes: number;
}

export interface AmendementDoc {
  id: string; // uid amendement
  numero: string;
  article: string | null;
  extrait: string; // début du dispositif, nettoyé
  statut: string;
  auteur: string | null;
  dossierUid: string | null; // pour lier vers la page loi
  dossierTitre: string | null;
}

export interface DeputeDoc {
  id: string; // uid AN
  nom: string;
  groupe: string | null;
}

// ---- Settings par index (searchable attrs, typo-tolérance, tri, facettes) ----

export const SETTINGS: Record<string, Settings> = {
  [INDEX.dossiers]: {
    searchableAttributes: ["titre"],
    filterableAttributes: ["adoptes"],
    sortableAttributes: ["amendements"],
    // les gros dossiers d'abord à pertinence égale
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness", "amendements:desc"],
  },
  [INDEX.amendements]: {
    searchableAttributes: ["numero", "auteur", "article", "extrait", "dossierTitre"],
    filterableAttributes: ["statut", "dossierUid"],
  },
  [INDEX.deputes]: {
    searchableAttributes: ["nom", "groupe"],
    filterableAttributes: ["groupe"],
  },
};

// Applique les settings d'un index (idempotent). Crée l'index s'il n'existe pas.
export async function ensureIndex(uid: string) {
  await meili.createIndex(uid, { primaryKey: "id" }).waitTask().catch(() => {
    /* déjà créé -> ignore */
  });
  await meili.index(uid).updateSettings(SETTINGS[uid]).waitTask({ timeout: 60_000 });
}
