export type StatutAmendement =
  | "Adopté"
  | "Rejeté"
  | "Retiré"
  | "Tombé"
  | "Non soutenu"
  | "En discussion"
  | "Non examiné";

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
  uid?: string; // identifiant AN, pour la page /amendement/[id]
  numero: string;
  auteur: Depute;
  statut: StatutAmendement;
  alinea?: string; // alinéa visé, champ officiel AN (ex. "Alinéa 13", "Après l'alinéa 7")
  dateDepot: string;
  dateAdoption?: string;
  // Dispositif de l'amendement (prose officielle nettoyée) : l'instruction telle
  // que publiée par l'AN, affichée verbatim (pas de diff synthétisé, trompeur).
  dispositif?: string;
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
  numeroAffiche?: string; // numéro officiel de dépôt (ex. "108"), lu dans l'acte de dépôt initial
  type?: string; // "Projet de loi" / "Proposition de loi" / … (déduit du titre)
  chambreOrigine?: string; // "Sénat" ou "Assemblée nationale" (chambre du 1er dépôt)
  dossierUrl?: string; // lien vers le dossier officiel sur assemblee-nationale.fr
  titre: string;
  statut: string;
  // Nature du statut, pour colorer le badge sans se fier au libellé :
  // "termine" (promulguée/adoptée) = vert, "encours" = bleu, "depose" = neutre.
  statutVariant: "termine" | "encours" | "depose";
  dateDepot: string;
  datePromulgation: string;
  // Loi officielle une fois promulguée (n° JO + lien Légifrance), si disponible.
  loiPromulguee?: { numero: string; date: string; urlLegifrance?: string };
  // Saisines du Conseil constitutionnel (si le texte a été déféré).
  conseilConstit?: { saisines: { date: string; par: string }[] };
  // Scrutins publics rattachés à ce dossier (votes solennels, sur articles…).
  // `scrutins` est borné pour le poids de page ; `scrutinsTotal` = nb réel.
  scrutins: Scrutin[];
  scrutinsTotal: number;
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
  repartitionGroupes: GroupeStat[];
  articles: Article[];
}

// Répartition des amendements d'un dossier par groupe politique (auteurs identifiés).
export interface GroupeStat {
  groupe: string; // abréviation AN (ex. "RN")
  libelle: string; // nom complet
  couleur: string;
  total: number;
  adoptes: number;
}

// Un scrutin public (vote solennel/ordinaire) avec son résultat.
export interface Scrutin {
  uid: string;
  numero?: string;
  date: string;
  titre: string;
  adopte: boolean; // sort = adopté
  sortLibelle?: string;
  pour: number;
  contre: number;
  abstention: number;
}

export type IconeThematique = "logement" | "energie" | "numerique";

export interface LoiResume {
  numero: string;
  numeroAffiche?: string; // numéro officiel de dépôt (ex. "108")
  type?: string; // "Projet de loi" / "Proposition de loi" / …
  chambre?: string; // "Sénat" ou "Assemblée nationale" (chambre d'origine)
  titre: string;
  icone: IconeThematique;
  amendements: number;
  deputesImpliques: number;
  derniereActualite: string; // date du dernier évènement connu sur ce dossier
  etape: { label: string; acteur: ActeurEtape }; // étape courante du parcours -> couleur liée à ParcoursHorizontal
}

// Un texte (dossier) déposé/initié par un député, pour sa fiche.
export interface TexteDepose {
  uid: string;
  titre: string;
  type: string; // "Proposition de loi", "Proposition de résolution", ...
  date: string;
  amendements: number;
}

// Un vote nominatif d'un député sur un scrutin public.
export interface VoteDepute {
  objet: string;
  position: "Pour" | "Contre" | "Abstention" | "Non-votant";
  date: string;
  adopte: boolean; // résultat du scrutin
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
  // Bilan des positions de vote (sur tous les scrutins publics).
  bilanVotes?: { pour: number; contre: number; abstention: number; nonVotant: number };
  // Activité : nb d'amendements déposés par mois (pour une frise).
  activite: { mois: string; libelle: string; total: number }[];
}

// Détail d'un amendement (page /amendement/[id]).
export interface AmendementDetail {
  uid: string;
  numero: string;
  auteur: Depute;
  statut: StatutAmendement;
  sort?: string; // sort brut AN (ex. "Adopté", "Retiré avant séance")
  article?: string; // désignation (ex. "ART. 3")
  alinea?: string; // alinéa visé
  dateDepot: string;
  dateSort?: string;
  dispositif?: string;
  exposeSommaire?: string; // « pourquoi » rédigé par l'auteur (exposé des motifs)
  cosignataires: Depute[]; // co-auteurs de l'amendement
  dossierUid?: string;
  dossierTitre?: string;
}
