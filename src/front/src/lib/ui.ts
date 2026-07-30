import { ActeurEtape, StatutAmendement } from "./types";

// Un « texte adopté en séance » ne réécrit pas l'article en entier : il se
// contente de marqueurs « (Non modifiée) » / « (Supprimé) » pour les parties
// inchangées ou retirées. Comparé (diff) à un texte complet, il ferait croire
// à tort que tout le contenu a été supprimé -> on identifie ces versions
// partielles pour ne pas les utiliser comme base de comparaison.
export function texteEstPartiel(alineas: string[] | undefined | null): boolean {
  if (!alineas || alineas.length === 0) return true;
  const marqueurs = alineas.filter((a) => /\(\s*(?:non\s*modifi|supprim|sans\s*modif)/i.test(a)).length;
  return marqueurs / alineas.length >= 0.34;
}

// Référence lisible d'un texte : « Proposition de loi n° 108 (Sénat) »,
// « Projet de loi n° 1906 ». La chambre n'est précisée que pour le Sénat,
// puisqu'un texte né au Sénat porte un numéro Sénat (source de confusion sinon).
export function libelleRef(type?: string, numero?: string, chambre?: string): string {
  const t = type && type !== "Texte déposé" ? type : "Dossier";
  const n = numero ? ` n° ${numero}` : "";
  const c = chambre === "Sénat" ? " (Sénat)" : "";
  return `${t}${n}${c}`;
}

export const badgeStatutClass: Record<StatutAmendement, string> = {
  Adopté: "bg-green-100 text-green-700",
  Rejeté: "bg-red-100 text-red-700",
  Retiré: "bg-gray-100 text-gray-600",
  Tombé: "bg-amber-100 text-amber-700",
  "Non soutenu": "bg-slate-100 text-slate-600",
  "En discussion": "bg-blue-100 text-blue-700",
  "Non examiné": "bg-slate-100 text-slate-500",
};

// Explication en langage clair de chaque statut (bulle d'aide)
export const statutExplication: Record<StatutAmendement, string> = {
  Adopté: "Amendement voté et intégré au texte de loi.",
  Rejeté: "Amendement soumis au vote mais non retenu.",
  Retiré: "Amendement retiré par son auteur avant le vote.",
  Tombé: "Amendement devenu sans objet (souvent parce qu'un autre amendement adopté l'a rendu caduc).",
  "Non soutenu": "Amendement non défendu en séance (auteur absent), donc non examiné.",
  "En discussion": "Amendement déposé, en cours d'examen — pas encore tranché.",
  "Non examiné": "Amendement déposé mais jamais examiné : la procédure s'est achevée sans qu'il soit appelé.",
};

export const dotStatutClass: Record<StatutAmendement, string> = {
  Adopté: "bg-green-500",
  Rejeté: "bg-red-500",
  Retiré: "bg-gray-400",
  Tombé: "bg-amber-500",
  "Non soutenu": "bg-slate-400",
  "En discussion": "bg-blue-500",
  "Non examiné": "bg-slate-300",
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
