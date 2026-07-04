// Couche d'accès aux données. Chaque fonction retourne pour l'instant du mock.
// A chaque endroit marqué "REQUETE SQL", remplacer le retour mock par l'appel DB reel.

import { projetLoi, sommaire, loisEnCours } from "./mock-data";
import { ProjetLoi, Article } from "./types";

// REQUETE SQL : SELECT numero, titre, icone, amendements, deputes_impliques, date_adoption, avancement
// FROM dossiers_legislatifs ORDER BY date_depot DESC LIMIT 3
// -> alimente aussi bien "Lois en cours" sur la home que la page /historique
export function getLoisEnCours() {
  return loisEnCours;
}

// REQUETE SQL : SELECT numero, titre, statut, date_depot, date_promulgation, version
// FROM dossiers_legislatifs WHERE id = :dossierId
export function getEnTeteLoi(dossierId: string): Pick<ProjetLoi, "numero" | "titre" | "statut" | "dateDepot" | "datePromulgation" | "version"> {
  return projetLoi;
}

// REQUETE SQL : SELECT label, date, fait, version
// FROM etapes_parcours WHERE dossier_id = :dossierId ORDER BY ordre
export function getParcours(dossierId: string): ProjetLoi["parcours"] {
  return projetLoi.parcours;
}

// REQUETE SQL : SELECT
//   COUNT(*) FILTER (WHERE true) AS amendements,
//   COUNT(*) FILTER (WHERE statut = 'Adopté') AS amendements_adoptes,
//   COUNT(DISTINCT depute_id) AS deputes_impliques,
//   (SELECT COUNT(*) FROM votes WHERE dossier_id = :dossierId) AS votes,
//   (SELECT SUM(duree_heures) FROM debats WHERE dossier_id = :dossierId) AS heures_debat
// FROM amendements WHERE dossier_id = :dossierId
export function getStats(dossierId: string): ProjetLoi["stats"] {
  return projetLoi.stats;
}

// REQUETE SQL : SELECT titre, chapitre, numero_article
// FROM articles WHERE dossier_id = :dossierId ORDER BY ordre
export function getSommaire(dossierId: string) {
  return sommaire;
}

// REQUETE SQL : SELECT a.numero, a.titre, av.texte
// FROM articles a
// JOIN versions_article av ON av.article_id = a.id AND av.est_version_courante = true
// WHERE a.dossier_id = :dossierId ORDER BY a.ordre
// -> sert au "texte de la loi complet" affiché quand aucune étape du parcours n'est sélectionnée
export function getTousLesArticles(dossierId: string): Article[] {
  return projetLoi.articles;
}

// REQUETE SQL : SELECT a.numero, a.titre, av.texte
// FROM articles a
// JOIN versions_article av ON av.article_id = a.id AND av.version = :version
// WHERE a.dossier_id = :dossierId AND a.numero = :numeroArticle
// (:version = version de l'étape du parcours sélectionnée -> texte tel qu'il était a ce stade)
export function getArticle(dossierId: string, numeroArticle: string, version?: string): Article | undefined {
  return projetLoi.articles.find((a) => a.numero === numeroArticle);
}

// REQUETE SQL : SELECT am.numero, d.nom AS auteur, gp.nom AS groupe, am.statut, am.date_depot, am.date_adoption
// FROM amendements am
// JOIN deputes d ON d.id = am.auteur_id
// JOIN groupes_politiques gp ON gp.id = d.groupe_id
// WHERE am.article_id = :articleId AND am.statut = 'Adopté'
// ORDER BY am.date_adoption DESC LIMIT 1
export function getAmendementActuel(articleId: string) {
  return projetLoi.articles.find((a) => a.numero === articleId)?.amendementActuel;
}

// REQUETE SQL : SELECT am.numero, d.nom AS auteur, gp.nom AS groupe, am.statut, am.date_depot, am.date_adoption
// FROM amendements am
// JOIN deputes d ON d.id = am.auteur_id
// JOIN groupes_politiques gp ON gp.id = d.groupe_id
// WHERE am.article_id = :articleId
// ORDER BY am.date_depot ASC
export function getHistoriqueAmendements(articleId: string) {
  return projetLoi.articles.find((a) => a.numero === articleId)?.historique ?? [];
}

// REQUETE SQL : SELECT * FROM amendements WHERE article_id = :articleId AND numero = :numeroAmendement
export function getAmendement(articleId: string, numeroAmendement: string) {
  return projetLoi.articles
    .find((a) => a.numero === articleId)
    ?.historique.find((am) => am.numero === numeroAmendement);
}

// REQUETE SQL : SELECT v1.numero_ligne, v1.texte AS avant, v2.texte AS apres
// FROM versions_article v1
// JOIN versions_article v2 ON v2.article_id = v1.article_id
// WHERE v1.article_id = :articleId AND v1.version = amendement.version_avant AND v2.version = amendement.version_apres
// (diff stocké/calculé par amendement, uniquement pertinent pour les amendements adoptés)
export function getDiffAmendement(articleId: string, numeroAmendement: string) {
  return getAmendement(articleId, numeroAmendement)?.diff;
}

// PAS une requete SQL : appel a un service de generation (LLM) sur le texte de
// l'amendement, pas une donnee stockee en base.
export function getResumeIA(articleId: string, numeroAmendement: string) {
  return getAmendement(articleId, numeroAmendement)?.resumeIA;
}

// REQUETE SQL : SELECT d.id, d.nom, gp.nom AS groupe, gp.couleur,
//   ROUND(100.0 * SUM(am.poids_contribution) / (SELECT SUM(poids_contribution) FROM amendements WHERE article_id = :articleId), 1) AS part
// FROM amendements am
// JOIN deputes d ON d.id = am.auteur_id
// JOIN groupes_politiques gp ON gp.id = d.groupe_id
// WHERE am.article_id = :articleId AND am.statut = 'Adopté'
// GROUP BY d.id, gp.nom, gp.couleur ORDER BY part DESC
// (poids_contribution = metrique a definir : nb lignes modifiees, nb mots, etc.)
export function getInfluenceurs(articleId: string) {
  return projetLoi.articles.find((a) => a.numero === articleId)?.influenceurs ?? [];
}
