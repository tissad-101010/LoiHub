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
  fait: boolean;
  version: string; // version du texte de loi a l'issue de cette étape
  acteur: ActeurEtape; // qui porte cette étape -> détermine la couleur affichée
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
}

export interface ProjetLoi {
  numero: string;
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
