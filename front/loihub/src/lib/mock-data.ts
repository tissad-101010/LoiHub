import { ProjetLoi, Depute, LoiResume } from "./types";

const jeanDupont: Depute = { id: "1", nom: "Jean Dupont", groupe: "Ensemble", couleur: "#2563eb" };
const claireMartin: Depute = { id: "2", nom: "Claire Martin", groupe: "Socialistes", couleur: "#a855f7" };
const pierreGrand: Depute = { id: "3", nom: "Pierre Grand", groupe: "Les Républicains", couleur: "#f97316" };
const sophieBlanc: Depute = { id: "4", nom: "Sophie Blanc", groupe: "Écologiste", couleur: "#22c55e" };
const marcLefevre: Depute = { id: "5", nom: "Marc Lefèvre", groupe: "Ensemble", couleur: "#2563eb" };
const julieRousseau: Depute = { id: "6", nom: "Julie Rousseau", groupe: "Rassemblement National", couleur: "#64748b" };

export const projetLoi: ProjetLoi = {
  numero: "1234",
  titre: "Projet de loi pour le logement abordable",
  statut: "Adopté définitivement",
  dateDepot: "12 janv. 2024",
  datePromulgation: "22 mai 2024",
  version: "v3.2 (finale)",
  parcours: [
    { label: "Dépôt du projet de loi", date: "12 janv. 2024", fait: true, version: "v1.0", acteur: "depot" },
    { label: "Examen en commission", date: "28 févr. 2024", fait: true, version: "v1.1", acteur: "commission" },
    { label: "Première lecture à l'Assemblée", date: "18 mars 2024", fait: true, version: "v2.0", acteur: "assemblee" },
    { label: "Lecture au Sénat", date: "10 avr. 2024", fait: true, version: "v2.1", acteur: "senat" },
    { label: "Seconde lecture à l'Assemblée", date: "15 mai 2024", fait: true, version: "v3.1", acteur: "assemblee" },
    { label: "Adoption définitive", date: "20 mai 2024", fait: true, version: "v3.2", acteur: "adoption" },
    { label: "Promulgation", date: "22 mai 2024", fait: true, version: "v3.2 (finale)", acteur: "promulgation" },
  ],
  stats: {
    amendements: 1248,
    amendementsAdoptes: 342,
    deputesImpliques: 312,
    deputesTotal: 577,
    votes: 24,
    heuresDebat: 17,
  },
  articles: [
    {
      numero: "12",
      titre: "Article 12",
      texte:
        "Le montant de l'aide est fixé à 700 euros par mois pour les ménages dont les ressources sont inférieures au plafond fixé par décret.",
      amendementActuel: {
        numero: "452",
        auteur: jeanDupont,
        statut: "Adopté",
        dateDepot: "12 mars 2024",
        dateAdoption: "15 mai 2024",
        resumeIA:
          "Cet amendement augmente le montant de l'aide mensuelle de 500 à 700 euros afin de mieux répondre à la hausse des coûts du logement et soutenir davantage les ménages modestes.",
        diff: {
          avant: [
            { numero: 1, texte: "Le montant de l'aide est fixé à", type: "inchange" },
            { numero: 2, texte: "500 euros par mois pour les ménages dont les", type: "supprime" },
            { numero: 3, texte: "ressources sont inférieures au plafond fixé par décret.", type: "inchange" },
          ],
          apres: [
            { numero: 1, texte: "Le montant de l'aide est fixé à", type: "inchange" },
            { numero: 2, texte: "700 euros par mois pour les ménages dont les", type: "ajoute" },
            { numero: 3, texte: "ressources sont inférieures au plafond fixé par décret.", type: "inchange" },
          ],
        },
      },
      historique: [
        { numero: "124", auteur: claireMartin, statut: "Retiré", dateDepot: "28 févr. 2024" },
        { numero: "305", auteur: pierreGrand, statut: "Rejeté", dateDepot: "18 mars 2024" },
        {
          numero: "452",
          auteur: jeanDupont,
          statut: "Adopté",
          dateDepot: "12 mars 2024",
          dateAdoption: "15 mai 2024",
          resumeIA:
            "Cet amendement augmente le montant de l'aide mensuelle de 500 à 700 euros afin de mieux répondre à la hausse des coûts du logement et soutenir davantage les ménages modestes.",
          diff: {
            avant: [
              { numero: 1, texte: "Le montant de l'aide est fixé à", type: "inchange" },
              { numero: 2, texte: "500 euros par mois pour les ménages dont les", type: "supprime" },
              { numero: 3, texte: "ressources sont inférieures au plafond fixé par décret.", type: "inchange" },
            ],
            apres: [
              { numero: 1, texte: "Le montant de l'aide est fixé à", type: "inchange" },
              { numero: 2, texte: "700 euros par mois pour les ménages dont les", type: "ajoute" },
              { numero: 3, texte: "ressources sont inférieures au plafond fixé par décret.", type: "inchange" },
            ],
          },
        },
        { numero: "812", auteur: sophieBlanc, statut: "Rejeté", dateDepot: "15 mai 2024" },
      ],
      influenceurs: [
        { depute: jeanDupont, part: 40 },
        { depute: claireMartin, part: 20 },
        { depute: pierreGrand, part: 15 },
        { depute: sophieBlanc, part: 10 },
        { depute: marcLefevre, part: 8 },
        { depute: julieRousseau, part: 7 },
      ],
    },
    {
      numero: "1",
      titre: "Article 1",
      texte: "La présente loi a pour objectif de garantir l'accès à un logement décent et abordable pour tous les ménages.",
      historique: [],
      influenceurs: [],
    },
    {
      numero: "2",
      titre: "Article 2",
      texte: "Les dispositions de la présente loi s'appliquent à l'ensemble du territoire national.",
      historique: [],
      influenceurs: [],
    },
    {
      numero: "3",
      titre: "Article 3",
      texte: "Un rapport annuel est remis au Parlement sur l'application de la présente loi.",
      historique: [],
      influenceurs: [],
    },
    {
      numero: "10",
      titre: "Article 10",
      texte: "Est considéré comme logement abordable tout logement dont le loyer n'excède pas le plafond fixé par décret.",
      historique: [],
      influenceurs: [],
    },
    {
      numero: "11",
      titre: "Article 11",
      texte: "Les bailleurs sociaux bénéficient d'un accompagnement renforcé pour la rénovation de leur parc immobilier.",
      historique: [],
      influenceurs: [],
    },
    {
      numero: "13",
      titre: "Article 13",
      texte: "L'aide prévue à l'article 12 est versée mensuellement par les organismes compétents.",
      historique: [],
      influenceurs: [],
    },
    {
      numero: "14",
      titre: "Article 14",
      texte: "Les modalités d'application du présent titre sont précisées par décret en Conseil d'État.",
      historique: [],
      influenceurs: [],
    },
  ],
};

export const sommaire = [
  {
    titre: "Titre I - Dispositions générales",
    chapitres: [
      { nom: "Chapitre I - Objectifs", articles: ["Article 1", "Article 2", "Article 3"] },
      { nom: "Chapitre II - Définitions", articles: [] },
    ],
  },
  {
    titre: "Titre II - Dispositions relatives au logement",
    chapitres: [
      { nom: null, articles: ["Article 10", "Article 11", "Article 12", "Article 13", "Article 14"] },
    ],
  },
  { titre: "Titre III - Dispositions financières", chapitres: [] },
];

// REQUETE SQL : SELECT numero, titre, icone, amendements, deputes_impliques, date_adoption, avancement
// FROM dossiers_legislatifs ORDER BY date_depot DESC LIMIT 3
export const loisEnCours: LoiResume[] = [
  {
    numero: "1234",
    titre: "Projet de loi pour le logement abordable",
    icone: "logement",
    amendements: 1248,
    deputesImpliques: 312,
    derniereActualite: "22 mai 2024",
    etape: { label: "Promulguée", acteur: "promulgation" },
  },
  {
    numero: "5678",
    titre: "Projet de loi relatif à la transition énergétique",
    icone: "energie",
    amendements: 892,
    deputesImpliques: 287,
    derniereActualite: "15 avril 2024",
    etape: { label: "Adoption définitive", acteur: "adoption" },
  },
  {
    numero: "9012",
    titre: "Projet de loi : Numérique et Innovation",
    icone: "numerique",
    amendements: 34,
    deputesImpliques: 12,
    derniereActualite: "28 juin 2024",
    etape: { label: "Examen en commission", acteur: "commission" },
  },
];
