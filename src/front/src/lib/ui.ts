import { ActeurEtape, StatutAmendement } from "./types";

export const badgeStatutClass: Record<StatutAmendement, string> = {
  Adopté: "bg-green-100 text-green-700",
  Rejeté: "bg-red-100 text-red-700",
  Retiré: "bg-gray-100 text-gray-600",
  Tombé: "bg-amber-100 text-amber-700",
  "Non soutenu": "bg-slate-100 text-slate-600",
  "En discussion": "bg-blue-100 text-blue-700",
};

export const dotStatutClass: Record<StatutAmendement, string> = {
  Adopté: "bg-green-500",
  Rejeté: "bg-red-500",
  Retiré: "bg-gray-400",
  Tombé: "bg-amber-500",
  "Non soutenu": "bg-slate-400",
  "En discussion": "bg-blue-500",
};

// Même logique de couleur que le parcours législatif (page loi) : vert = dépôt/
// adoption/promulgation, violet = commission, bleu = Assemblée, rouge = Sénat.
export const COULEUR_ACTEUR: Record<ActeurEtape, { clair: string; accent: string }> = {
  depot: { clair: "#dcfce7", accent: "#16a34a" },
  adoption: { clair: "#dcfce7", accent: "#16a34a" },
  promulgation: { clair: "#dcfce7", accent: "#16a34a" },
  commission: { clair: "#ede9fe", accent: "#7c3aed" },
  assemblee: { clair: "#dbeafe", accent: "#2563eb" },
  senat: { clair: "#fee2e2", accent: "#dc2626" },
};
