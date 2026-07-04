export type StatutAmendement =
  | "Adopté"
  | "Rejeté"
  | "Retiré"
  | "Tombé"
  | "Non soutenu"
  | "En discussion";

export interface Depute {
  id: string;
  nom: string;
  groupe: string;
  couleur: string; // couleur tailwind du groupe (ex: "#2563eb")
  photoUrl?: string;
  institution?: "assemblee" | "senat";
}

export interface DiffLigne {
  numero: number;
  texte: string;
  type: "supprime" | "ajoute" | "inchange";
}

export interface Amendement {
  numero: string;
  auteur: Depute;
  statut: StatutAmendement;
  dateDepot: string;
  dateAdoption?: string;
  resumeIA?: string;
  diff?: { avant: DiffLigne[]; apres: DiffLigne[] };
}

export type ActeurEtape = "depot" | "commission" | "assemblee" | "senat" | "adoption" | "promulgation";

export interface EtapeParcours {
  label: string;
  date: string;
  dateIso?: string; // date brute (ISO) pour retrouver la version du texte à cette étape
  fait: boolean;
  version: string; // version du texte de loi a l'issue de cette étape
  acteur: ActeurEtape; // qui porte cette étape -> détermine la couleur affichée
}

// une version datée du texte d'un article (issue de LawText)
export interface VersionArticle {
  label: string;
  dateIso: string;
  alineas: string[];
}

export interface Article {
  numero: string;
  titre: string;
  texte: string;
  amendementActuel?: Amendement;
  historique: Amendement[];
  influenceurs: { depute: Depute; part: number }[];
  diffTexte?: DiffLigne[];
  diffTexteInfo?: { avant: string; apres: string };
  versionsTexte?: VersionArticle[]; // texte de l'article à chaque version datée
}

export interface ProjetLoi {
  numero: string;
  numeroAffiche?: string; // numéro lisible (réf. AN sans le préfixe technique)
  dossierUrl?: string; // lien vers le dossier officiel sur assemblee-nationale.fr
  titre: string;
  statut: string;
  dateDepot: string;
  datePromulgation: string;
  version: string;
  parcours: EtapeParcours[];
  stats: {
    amendements: number;
    amendementsAdoptes: number;
    deputesImpliques: number;
    deputesTotal: number;
    votes: number;
    heuresDebat: number;
  };
  articles: Article[];
}

// Un texte (dossier) déposé/initié par un député, pour sa fiche.
export interface TexteDepose {
  uid: string;
  titre: string;
  type: string; // "Proposition de loi", "Proposition de résolution", ...
  date: string;
  amendements: number;
}

// Un vote nominatif d'un député (dataset scrutins — pas encore importé).
export interface VoteDepute {
  objet: string;
  position: "Pour" | "Contre" | "Abstention";
  date: string;
  loiUid?: string;
}

// Fiche complète d'un député (page /depute/[id]).
export interface DeputeProfil {
  id: string;
  nom: string; // "Prénom Nom"
  prenom: string;
  nomFamille: string;
  civilite: string; // "M." / "Mme"
  groupe: string; // abréviation AN
  groupeLibelle?: string; // libellé complet du groupe si connu
  couleur: string;
  photoUrl?: string;
  circonscription?: string; // "Gironde (4e circonscription)"
  dateDebutMandat?: string; // date de prise de fonction, formatée
  dateDebutMandatIso?: string;
  premiereElection: boolean; // législature en cours = 1er mandat ?
  fonction?: string; // qualité principale (président de groupe, rapporteur…)
  stats: {
    amendements: number;
    amendementsAdoptes: number;
    textesDeposes: number;
    votes: number;
  };
  derniersAmendements: (Amendement & { dossierUid?: string; dossierTitre?: string })[];
  textesDeposes: TexteDepose[];
  votes: VoteDepute[];
}

export type IconeThematique = "logement" | "energie" | "numerique";

export interface LoiResume {
  numero: string;
  titre: string;
  icone: IconeThematique;
  amendements: number;
  deputesImpliques: number;
  derniereActualite: string; // date du dernier évènement connu sur ce dossier
  etape: { label: string; acteur: ActeurEtape }; // étape courante du parcours -> couleur liée à ParcoursHorizontal
}
