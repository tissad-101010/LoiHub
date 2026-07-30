// Lexique citoyen : définitions en langage simple des termes du travail
// parlementaire, affichées au survol/clic via le composant <Terme>.
// Règle d'écriture : une ou deux phrases, sans jargon, factuelles.

export const LEXIQUE = {
  amendement:
    "Proposition de modification d'un texte de loi (ajouter, changer ou supprimer une phrase ou un article). Chaque amendement est déposé par un ou plusieurs parlementaires, puis adopté ou rejeté par un vote.",
  "projet de loi":
    "Texte proposé par le Gouvernement. Quand le texte vient d'un parlementaire, on parle de « proposition de loi ».",
  "proposition de loi":
    "Texte proposé par un ou plusieurs parlementaires (députés ou sénateurs), et non par le Gouvernement.",
  navette:
    "Allers-retours d'un texte entre l'Assemblée nationale et le Sénat : chaque chambre l'examine et le modifie jusqu'à un accord sur une version commune.",
  commission:
    "Groupe de députés spécialisés (lois, finances, affaires sociales…) qui examine et retravaille le texte avant son passage en séance devant tous les députés.",
  "scrutin public":
    "Vote officiel où la position de chaque député (pour, contre, abstention) est enregistrée et publiée.",
  dispositif:
    "La partie « opérationnelle » d'un amendement : l'instruction précise de ce qu'il faut modifier dans le texte (par exemple : « à l'alinéa 8, remplacer tel mot par tel autre »).",
  "exposé des motifs":
    "Texte où l'auteur d'un amendement (ou d'un projet de loi) explique pourquoi il propose cette modification.",
  cosignataires:
    "Parlementaires qui soutiennent officiellement un amendement en y ajoutant leur signature, aux côtés de son premier auteur.",
  alinéa:
    "Paragraphe numéroté d'un article de loi. Les amendements visent souvent un alinéa précis.",
  promulgation:
    "Acte par lequel le président de la République signe la loi votée, qui est ensuite publiée au Journal officiel et entre en vigueur.",
  CMP:
    "Commission mixte paritaire : réunion de 7 députés et 7 sénateurs chargée de trouver un texte de compromis quand les deux chambres ne sont pas d'accord.",
  "groupe politique":
    "Ensemble de députés partageant la même orientation politique, qui s'organisent ensemble à l'Assemblée (temps de parole, sièges en commission…).",
  "Conseil constitutionnel":
    "Institution qui vérifie, avant l'entrée en vigueur d'une loi, qu'elle respecte la Constitution. Elle peut censurer tout ou partie du texte.",
} as const;

export type TermeLexique = keyof typeof LEXIQUE;
