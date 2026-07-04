// Couche d'accès aux données RÉELLES (server-only) : reconstruit un ProjetLoi
// depuis la base Postgres (dossiers + lois/versions + amendements de l'open data AN).
//
// Limites assumées (l'open data AN ne fournit pas ces éléments) :
//  - texte articulé des lois -> non disponible (divisions vides). On affiche le
//    dispositif de l'amendement comme contenu, avec une mention explicite.
//  - diff ligne-à-ligne -> non calculable (les amendements sont en prose).
//  - groupes des anciens mandats parfois absents -> on affiche la référence AN
//    quand la source officielle ne donne pas plus.
//  - votes / heures de débat -> datasets non importés -> 0.

import { prisma } from "./prisma";
import { getInfoParlementaireOfficielle, photoParlementaireUrl } from "./parlementaires";
import type {
  ProjetLoi,
  Article,
  Amendement,
  EtapeParcours,
  ActeurEtape,
  StatutAmendement,
  Depute,
  DiffLigne,
  LoiResume,
  IconeThematique,
} from "./types";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// L'API AN encode souvent "un objet OU un tableau" -> on normalise en tableau.
function asArray<T>(x: T | T[] | null | undefined): T[] {
  if (x === null || x === undefined) return [];
  return Array.isArray(x) ? x : [x];
}

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
function formatDate(v: unknown): string {
  if (typeof v !== "string" || !v.trim()) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
}

// nettoie le HTML des dispositifs/exposés d'amendement en texte lisible
function stripHtml(html: unknown): string {
  if (typeof html !== "string") return "";
  return html
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&laquo;|&#171;/gi, "«")
    .replace(/&raquo;|&#187;/gi, "»")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// codeActe (SN1, AN1, CMP, ...) -> acteur pour la couleur du parcours
function acteurFromCode(code: string): ActeurEtape {
  const c = (code || "").toUpperCase();
  if (c.includes("DEPOT")) return "depot";
  // Codes réels AN pour la promulgation : "PROM" (acte de promulgation) et
  // "PROM-PUB" (publication au JO). L'ancien test "PROMUL" ne matchait ni l'un
  // ni l'autre -> l'étape tombait en "commission" et datePromulgation restait vide.
  if (c.includes("PROM")) return "promulgation";
  if (c.includes("CONSTIT") || c.includes("ADOPT") || c.includes("LECT-DEF")) return "adoption";
  // Une Commission Mixte Paritaire est une commission (violet), pas une adoption :
  // la colorer en vert laissait croire à tort que la CMP avait abouti.
  if (c.includes("COM") || c.includes("CMP")) return "commission";
  if (c.startsWith("AN")) return "assemblee";
  if (c.startsWith("SN")) return "senat";
  return "commission";
}

// statut Prisma + sort AN -> StatutAmendement du front
function toStatut(status: string, sort: string | null): StatutAmendement {
  if (status === "ACCEPTED") return "Adopté";
  if (status === "REJECTED") return "Rejeté";
  const s = (sort || "").toLowerCase();
  if (s.includes("retir")) return "Retiré";
  if (s.includes("tomb")) return "Tombé";
  if (s.includes("non soutenu")) return "Non soutenu";
  return "En discussion";
}

// première date trouvée en profondeur dans un arbre d'actes
function earliestDate(node: unknown): string | null {
  let best: string | null = null;
  const visit = (n: any) => {
    if (!n || typeof n !== "object") return;
    if (typeof n.dateActe === "string") {
      if (!best || n.dateActe < best) best = n.dateActe;
    }
    for (const acte of asArray(n?.actesLegislatifs?.acteLegislatif)) visit(acte);
  };
  visit(node);
  return best;
}

/* ------------------------------------------------------------------ */
/* Parcours législatif à partir de dossierParlementaire.actesLegislatifs */
/* ------------------------------------------------------------------ */

function buildParcours(dp: any): EtapeParcours[] {
  const actes = asArray(dp?.actesLegislatifs?.acteLegislatif);
  const etapes: EtapeParcours[] = [];
  let v = 0;

  for (const acte of actes) {
    const code = acte?.codeActe ?? "";
    const label = acte?.libelleActe?.nomCanonique ?? acte?.libelleActe?.libelleCourt ?? code ?? "Étape";
    const dateIso = acte?.dateActe ?? earliestDate(acte);
    v += 1;
    etapes.push({
      label: String(label),
      date: formatDate(dateIso),
      dateIso: typeof dateIso === "string" ? dateIso : undefined,
      fait: !!dateIso && new Date(dateIso).getTime() <= Date.now(),
      version: `v${v}.0`,
      acteur: acteurFromCode(code),
    });
  }
  return etapes;
}

/* ------------------------------------------------------------------ */
/* Requête principale                                                 */
/* ------------------------------------------------------------------ */

type AmendmentRow = {
  uid?: string;
  numeroLong: string | null;
  numeroOrdreDepot: string | null;
  article: string | null;
  content?: string | null; // chargé à la demande (pas en masse)
  status: string;
  sort: string | null;
  dateDepot: Date | null;
  dateSort: Date | null;
  authorId: string | null;
};

// Palette par groupe politique (abréviations AN, législature 17)
const GROUPE_COULEUR: Record<string, string> = {
  RN: "#1f4e79",
  UDR: "#0f2d52",
  DR: "#2563eb",
  LR: "#2563eb",
  "EPR": "#f7b32b",
  RE: "#f7b32b",
  ENS: "#f7b32b",
  DEM: "#f97316",
  HOR: "#12b3c7",
  LIOT: "#eab308",
  SOC: "#e05a8a",
  "EcoS": "#22c55e",
  ECO: "#22c55e",
  "LFI-NFP": "#cc2443",
  LFI: "#cc2443",
  GDR: "#b71c1c",
  NI: "#94a3b8",
};
function couleurGroupe(group: string | null): string {
  if (!group) return "#64748b";
  return GROUPE_COULEUR[group] ?? "#64748b";
}

export type DeputeMap = Map<
  string,
  { name: string; group: string | null; photoUrl?: string; institution?: "assemblee" | "senat" }
>;

function deputeFromId(id: string | null | undefined, deputes: DeputeMap): Depute {
  const dep = id ? deputes.get(id) : undefined;
  const photoUrl = id ? dep?.photoUrl ?? photoParlementaireUrl(id) : undefined;

  return {
    id: id ?? "?",
    nom: dep?.name ?? (id ? `Réf. ${id}` : "Auteur inconnu"),
    groupe: dep?.group ?? "",
    couleur: couleurGroupe(dep?.group ?? null),
    photoUrl,
    institution: dep?.institution ?? (/^PA\d+$/.test(id ?? "") ? "assemblee" : undefined),
  };
}

// Construit un diff rouge/vert à partir du dispositif (prose) de l'amendement.
// L'open data AN ne donne pas le texte de loi ; on affiche donc CE QUE
// l'amendement modifie, extrait de sa rédaction juridique normalisée.
function buildDiff(
  content: string | null | undefined
): { avant: DiffLigne[]; apres: DiffLigne[] } | undefined {
  const texte = stripHtml(content);
  if (!texte) return undefined;
  const low = texte.toLowerCase();

  const quotes = [...texte.matchAll(/«\s*([^«»]+?)\s*»/g)]
    .map((m) => m[1].trim())
    .filter(Boolean)
    .map((s) => (s.length > 400 ? s.slice(0, 400) + "…" : s));

  // localisation (alinéa N / cet article)
  const alinea = texte.match(/alin[ée]as?\s*n?°?\s*(\d+)/i);
  const loc = alinea
    ? `Alinéa ${alinea[1]} — `
    : /cet article/i.test(texte)
      ? "Cet article — "
      : "";
  const locLine = (arr: DiffLigne[]): DiffLigne[] =>
    loc ? [{ numero: 0, texte: loc, type: "inchange" }, ...arr] : arr;

  // suppression d'article entier
  if (/supprimer cet article/i.test(low)) {
    return {
      avant: [{ numero: 1, texte: "Cet article est supprimé.", type: "supprime" }],
      apres: [],
    };
  }
  // substitution / remplacement : «ancien» -> «nouveau»
  if (/(substitu|remplac)/i.test(low) && quotes.length >= 2) {
    return {
      avant: locLine([{ numero: 1, texte: quotes[0], type: "supprime" }]),
      apres: locLine([{ numero: 1, texte: quotes[1], type: "ajoute" }]),
    };
  }
  // suppression de mots
  if (/supprim/i.test(low) && quotes.length >= 1) {
    return {
      avant: locLine(quotes.map((q, i) => ({ numero: i + 1, texte: q, type: "supprime" as const }))),
      apres: locLine([]),
    };
  }
  // insertion / complément / rédaction
  if (/(ins[ée]r|compl[ée]t|ajout|r[ée]dig)/i.test(low) && quotes.length >= 1) {
    return {
      avant: locLine([]),
      apres: locLine(quotes.map((q, i) => ({ numero: i + 1, texte: q, type: "ajoute" as const }))),
    };
  }
  return undefined; // formulation non reconnue -> DiffViewer montre la prose
}

// withContent : n'inclure le dispositif (lourd) que pour l'amendement affiché,
// pas pour toute la liste d'historique (sinon payload de plusieurs Mo).
function mapAmendement(a: AmendmentRow, deputes: DeputeMap, withContent = false): Amendement {
  const auteur = deputeFromId(a.authorId, deputes);
  return {
    numero: a.numeroLong ?? a.numeroOrdreDepot ?? "?",
    auteur,
    statut: toStatut(a.status, a.sort),
    dateDepot: formatDate(a.dateDepot?.toISOString()),
    dateAdoption: a.status === "ACCEPTED" ? formatDate(a.dateSort?.toISOString()) : undefined,
    resumeIA: withContent ? stripHtml(a.content) || undefined : undefined,
    // diff rouge/vert extrait du dispositif de l'amendement
    diff: buildDiff(a.content),
  };
}

// bornes pour garder un payload raisonnable côté client
const MAX_ARTICLES = 60;
const MAX_HISTO = 80;

// désignation d'article AN ("ART. 12", "ART. UNIQUE", "ART. PRELIM.") -> numéro court
function articleNumero(designation: string | null): string {
  if (!designation) return "—";
  const m = designation.match(/(\d+)/);
  if (m) return m[1];
  // "Article premier" / "ART. PREMIER" : pas de chiffre mais c'est l'article 1er
  if (/premier/i.test(designation)) return "1";
  return designation.replace(/^ART\.?\s*/i, "").trim() || designation;
}

// diff ligne-à-ligne (LCS) entre deux listes d'alinéas -> DiffLigne[]
function diffLines(a: string[], b: string[]): DiffLigne[] {
  const A = a.slice(0, 400);
  const B = b.slice(0, 400);
  const n = A.length,
    m = B.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffLigne[] = [];
  let i = 0,
    j = 0,
    k = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) out.push({ numero: ++k, texte: A[i++], type: "inchange" }), j++;
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ numero: ++k, texte: A[i++], type: "supprime" });
    else out.push({ numero: ++k, texte: B[j++], type: "ajoute" });
  }
  while (i < n) out.push({ numero: ++k, texte: A[i++], type: "supprime" });
  while (j < m) out.push({ numero: ++k, texte: B[j++], type: "ajoute" });
  return out;
}

// { "Article 1er": [...] } -> Map "1" -> [...]  (indexé par numéro)
function indexByNum(articles: Record<string, string[]>): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const [key, alineas] of Object.entries(articles)) {
    const num = articleNumero(key);
    // on garde la 1ère occurrence "pleine" (évite "1er bis")
    if (!map.has(num)) map.set(num, alineas);
  }
  return map;
}

export async function getProjetLoi(dossierUid: string): Promise<ProjetLoi | null> {
  const dossier = await prisma.dossier.findUnique({
    where: { uid: dossierUid },
  });
  if (!dossier) return null;

  const dp = (dossier.raw as any)?.dossierParlementaire ?? {};
  const parcours = buildParcours(dp);

  // amendements du dossier (via Law.dossierId)
  const amendements = await prisma.amendment.findMany({
    where: { law: { dossierId: dossier.id } },
    select: {
      uid: true,
      numeroLong: true,
      numeroOrdreDepot: true,
      article: true,
      // content NON chargé en masse (14k blobs = lent) ; récupéré plus bas
      // uniquement pour les amendements réellement affichés.
      status: true,
      sort: true,
      dateDepot: true,
      dateSort: true,
      authorId: true,
    },
    orderBy: { dateDepot: "asc" },
  });

  // résolution des auteurs (réf AN -> nom + groupe) depuis la table Deputy
  const authorIds = [...new Set(amendements.map((a) => a.authorId).filter(Boolean))] as string[];
  const deputesRows = authorIds.length
    ? await prisma.deputy.findMany({
        where: { uid: { in: authorIds } },
        select: { uid: true, name: true, group: true },
      })
    : [];
  const deputes: DeputeMap = new Map(
    deputesRows.map((d) => [
      d.uid as string,
      {
        name: d.name,
        group: d.group,
        photoUrl: photoParlementaireUrl(d.uid as string),
        institution: /^PA\d+$/.test(d.uid as string) ? "assemblee" : undefined,
      },
    ])
  );

  const missingAuthorIds = authorIds.filter((id) => !deputes.has(id)).slice(0, 160);
  const officialInfos = await Promise.all(missingAuthorIds.map((id) => getInfoParlementaireOfficielle(id)));
  for (const info of officialInfos) {
    if (!info.nom && !info.photoUrl) continue;
    deputes.set(info.id, {
      name: info.nom ?? `Réf. ${info.id}`,
      group: null,
      photoUrl: info.photoUrl,
      institution: info.source,
    });
  }

  // versions de texte parsées (opendata AN) pour le diff avant/après réel
  const lawTexts = await prisma.lawText.findMany({
    where: { dossierUid },
    orderBy: { ordre: "asc" },
    select: { label: true, articles: true, ordre: true, date: true },
  });
  const versionsIdx = lawTexts.map((v, i) => {
    // "Texte déposé" après une adoption = re-dépôt en navette (transmission),
    // pas le dépôt initial -> label plus honnête pour ne pas dérouter.
    let base = v.label;
    if (base === "Texte déposé" && i > 0) base = "Texte transmis (navette)";
    const d = formatDate(v.date ?? undefined);
    return {
      label: d ? `${base} (${d})` : base, // date -> chronologie explicite
      dateIso: v.date ?? "",
      byNum: indexByNum(v.articles as Record<string, string[]>),
    };
  });
  // pour un numéro d'article : diff entre 1ère et dernière version qui le contiennent
  function diffTexteArticle(num: string): { diff: DiffLigne[]; avant: string; apres: string } | null {
    const withArt = versionsIdx.filter((v) => v.byNum.has(num));
    if (withArt.length < 2) return null;
    const premiere = withArt[0];
    const derniere = withArt[withArt.length - 1];
    const a = premiere.byNum.get(num)!;
    const b = derniere.byNum.get(num)!;
    if (a.join("\n") === b.join("\n")) return null; // pas de changement
    return { diff: diffLines(a, b), avant: premiere.label, apres: derniere.label };
  }

  // vrai texte de l'article (dernière version parsée qui le contient)
  function texteArticle(num: string): string | null {
    const withArt = versionsIdx.filter((v) => v.byNum.has(num));
    if (!withArt.length) return null;
    return withArt[withArt.length - 1].byNum.get(num)!.join("\n\n");
  }

  // toutes les versions datées du texte de cet article (pour le lien avec le parcours)
  function versionsTexteArticle(num: string) {
    return versionsIdx
      .filter((v) => v.byNum.has(num))
      .map((v) => ({ label: v.label, dateIso: v.dateIso, alineas: v.byNum.get(num)! }));
  }

  // regroupement par NUMÉRO d'article (fusionne "ART. 12", "ART. 12 annexe"...)
  const parArticle = new Map<string, AmendmentRow[]>();
  for (const a of amendements) {
    const key = articleNumero(a.article);
    if (!parArticle.has(key)) parArticle.set(key, []);
    parArticle.get(key)!.push(a);
  }

  const uidActuelParNumero = new Map<string, string>();
  const articles: Article[] = [...parArticle.entries()]
    // on ne garde que les vrais articles numérotés : on écarte les seaux
    // parasites issus des désignations d'amendements ("TITRE", "APRÈS ART. …",
    // "—") qui ne correspondent à aucun article de la loi.
    .filter(([numero]) => /^\d/.test(numero))
    // top articles par nombre réel d'amendements, puis bornés
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, MAX_ARTICLES)
    .map(([numero, rows]) => {
      const adoptes = rows.filter((r) => r.status === "ACCEPTED");
      const dernierAdopte = adoptes[adoptes.length - 1];
      if (dernierAdopte?.uid) uidActuelParNumero.set(numero, dernierAdopte.uid);

      const dt = diffTexteArticle(numero);

      return {
        numero,
        titre: numero && numero !== "—" ? `Article ${numero}` : "Article",
        // vrai texte de l'article si on l'a parsé, sinon note courte et claire
        texte:
          texteArticle(numero) ??
          "Le texte de cet article n'est pas encore disponible. Vous pouvez consulter ci-dessous les amendements qui le concernent.",
        amendementActuel: dernierAdopte ? mapAmendement(dernierAdopte, deputes, true) : undefined,
        // historique + influenceurs NE sont PAS dans le payload initial : ils ne
        // s'affichent que pour l'article actif (après sélection d'une étape) et
        // pèsent jusqu'à MAX_HISTO × MAX_ARTICLES amendements (~3 Mo de HTML).
        // Chargés à la demande via getArticleDetail() / GET /api/article.
        historique: [],
        influenceurs: [],
        diffTexte: dt?.diff,
        diffTexteInfo: dt ? { avant: dt.avant, apres: dt.apres } : undefined,
        versionsTexte: versionsTexteArticle(numero),
      } as Article;
    });

  // On sélectionne les articles les plus amendés (ci-dessus) mais on les AFFICHE
  // dans l'ordre de lecture de la loi (1, 2, 3…) et non par nombre d'amendements.
  articles.sort((a, b) => {
    const na = parseInt(a.numero, 10);
    const nb = parseInt(b.numero, 10);
    if (Number.isNaN(na) && Number.isNaN(nb)) return 0;
    if (Number.isNaN(na)) return 1;
    if (Number.isNaN(nb)) return -1;
    return na - nb;
  });

  // contenu (dispositif) chargé UNIQUEMENT pour les amendements affichés (~60),
  // pas pour les 14k -> gros gain de perf sur la page loi.
  const uidsActuels = [...uidActuelParNumero.values()];
  if (uidsActuels.length) {
    const contenus = await prisma.amendment.findMany({
      where: { uid: { in: uidsActuels } },
      select: { uid: true, content: true },
    });
    const contentByUid = new Map(contenus.map((c) => [c.uid, c.content]));
    for (const art of articles) {
      const u = uidActuelParNumero.get(art.numero);
      const c = u ? contentByUid.get(u) : null;
      if (c && art.amendementActuel) {
        art.amendementActuel.resumeIA = stripHtml(c) || undefined;
        art.amendementActuel.diff = buildDiff(c);
      }
    }
  }

  const adoptes = amendements.filter((a) => a.status === "ACCEPTED").length;
  const auteurs = new Set(amendements.map((a) => a.authorId).filter(Boolean));

  const premiereDate = parcours.find((e) => e.date)?.date ?? "";
  const derniereEtape = [...parcours].reverse().find((e) => e.date);

  // lien vers le dossier officiel AN (via titreChemin + législature)
  const legislature = dp?.legislature ?? dossier.uid?.match(/L(\d+)N/)?.[1] ?? "17";
  const chemin = dp?.titreDossier?.titreChemin ?? dossier.uid;
  const dossierUrl = chemin
    ? `https://www.assemblee-nationale.fr/dyn/${legislature}/dossiers/${chemin}`
    : undefined;

  return {
    numero: dossier.uid ?? dossier.id,
    // numéro lisible pour l'affichage (partie numérique du réf. AN)
    numeroAffiche: dossier.uid?.match(/N(\d+)/)?.[1] ?? dossier.uid ?? "",
    dossierUrl,
    titre: dossier.title ?? "Dossier législatif",
    statut: dp?.actesLegislatifs ? "En cours de procédure" : "Déposé",
    dateDepot: premiereDate,
    datePromulgation:
      parcours.find((e) => e.acteur === "promulgation")?.date ?? "",
    version: derniereEtape?.version ?? "v1.0",
    parcours,
    stats: {
      amendements: amendements.length,
      amendementsAdoptes: adoptes,
      deputesImpliques: auteurs.size,
      deputesTotal: 577,
      votes: 0, // dataset scrutins non importé
      heuresDebat: 0, // dataset débats non importé
    },
    articles,
  };
}

// Détail d'UN article, chargé à la demande (l'historique + les influenceurs ne
// sont pas dans le payload initial de getProjetLoi -> gros gain de poids de page).
// On ne résout les auteurs (y compris fallback réseau) que pour cet article.
export async function getArticleDetail(
  dossierUid: string,
  numero: string
): Promise<{ historique: Amendement[]; influenceurs: { depute: Depute; part: number }[] } | null> {
  const dossier = await prisma.dossier.findUnique({
    where: { uid: dossierUid },
    select: { id: true },
  });
  if (!dossier) return null;

  const amendements = await prisma.amendment.findMany({
    where: { law: { dossierId: dossier.id } },
    select: {
      uid: true,
      numeroLong: true,
      numeroOrdreDepot: true,
      article: true,
      status: true,
      sort: true,
      dateDepot: true,
      dateSort: true,
      authorId: true,
    },
    orderBy: { dateDepot: "asc" },
  });

  // uniquement les amendements de l'article demandé
  const rows = amendements.filter((a) => articleNumero(a.article) === numero);
  if (!rows.length) return { historique: [], influenceurs: [] };

  // résolution des auteurs pour CET article seulement (≤ quelques dizaines)
  const authorIds = [...new Set(rows.map((a) => a.authorId).filter(Boolean))] as string[];
  const deputesRows = authorIds.length
    ? await prisma.deputy.findMany({
        where: { uid: { in: authorIds } },
        select: { uid: true, name: true, group: true },
      })
    : [];
  const deputes: DeputeMap = new Map(
    deputesRows.map((d) => [
      d.uid as string,
      {
        name: d.name,
        group: d.group,
        photoUrl: photoParlementaireUrl(d.uid as string),
        institution: /^PA\d+$/.test(d.uid as string) ? ("assemblee" as const) : undefined,
      },
    ])
  );
  const missingAuthorIds = authorIds.filter((id) => !deputes.has(id)).slice(0, 160);
  const officialInfos = await Promise.all(
    missingAuthorIds.map((id) => getInfoParlementaireOfficielle(id))
  );
  for (const info of officialInfos) {
    if (!info.nom && !info.photoUrl) continue;
    deputes.set(info.id, {
      name: info.nom ?? `Réf. ${info.id}`,
      group: null,
      photoUrl: info.photoUrl,
      institution: info.source,
    });
  }

  const historique = rows.slice(0, MAX_HISTO).map((r) => mapAmendement(r, deputes));

  // influenceurs = part des auteurs parmi les amendements adoptés
  const adoptes = rows.filter((r) => r.status === "ACCEPTED");
  const compteur = new Map<string, number>();
  for (const r of adoptes) {
    const k = r.authorId ?? "?";
    compteur.set(k, (compteur.get(k) ?? 0) + 1);
  }
  const totalAdoptes = adoptes.length || 1;
  const influenceurs = [...compteur.entries()]
    .sort((x, y) => y[1] - x[1])
    .slice(0, 8)
    .map(([id, n]) => ({
      depute: deputeFromId(id, deputes),
      part: Math.round((100 * n) / totalAdoptes),
    }));

  return { historique, influenceurs };
}

// Dossier par défaut = celui qui a le plus d'amendements liés (pour la démo).
// Repli : s'il n'y a pas encore d'amendements, on prend n'importe quel dossier.
export async function getDossierParDefaut(): Promise<string | null> {
  const rows = await prisma.$queryRaw<{ uid: string; n: bigint }[]>`
    SELECT d."uid" AS uid, COUNT(a.id) AS n
    FROM "Dossier" d
    JOIN "Law" l ON l."dossierId" = d.id
    JOIN "Amendment" a ON a."lawId" = l.id
    WHERE d."uid" IS NOT NULL
    GROUP BY d."uid"
    ORDER BY n DESC
    LIMIT 1
  `;
  if (rows[0]?.uid) return rows[0].uid;

  const fallback = await prisma.dossier.findFirst({
    where: { uid: { not: null } },
    select: { uid: true },
  });
  return fallback?.uid ?? null;
}

// Liste des dossiers (pour la page d'accueil), triés par nb d'amendements.
export type DossierListItem = {
  uid: string;
  titre: string;
  amendements: number;
  adoptes: number;
};

export async function getDossiersList(query?: string): Promise<DossierListItem[]> {
  const q = (query ?? "").trim();
  const like = `%${q}%`;
  const rows = q
    ? await prisma.$queryRaw<{ uid: string; titre: string; n: bigint; adoptes: bigint }[]>`
        SELECT d."uid" AS uid, d."title" AS titre,
               COUNT(a.id) AS n,
               COUNT(a.id) FILTER (WHERE a."status" = 'ACCEPTED') AS adoptes
        FROM "Dossier" d
        JOIN "Law" l ON l."dossierId" = d.id
        JOIN "Amendment" a ON a."lawId" = l.id
        WHERE d."uid" IS NOT NULL AND d."title" ILIKE ${like}
        GROUP BY d."uid", d."title"
        ORDER BY n DESC
        LIMIT 60`
    : await prisma.$queryRaw<{ uid: string; titre: string; n: bigint; adoptes: bigint }[]>`
        SELECT d."uid" AS uid, d."title" AS titre,
               COUNT(a.id) AS n,
               COUNT(a.id) FILTER (WHERE a."status" = 'ACCEPTED') AS adoptes
        FROM "Dossier" d
        JOIN "Law" l ON l."dossierId" = d.id
        JOIN "Amendment" a ON a."lawId" = l.id
        WHERE d."uid" IS NOT NULL
        GROUP BY d."uid", d."title"
        ORDER BY n DESC
        LIMIT 60`;

  return rows.map((r) => ({
    uid: r.uid,
    titre: r.titre,
    amendements: Number(r.n),
    adoptes: Number(r.adoptes),
  }));
}

// thématique -> forme d'icône (heuristique sur le titre)
function iconeFromTitre(t: string): IconeThematique {
  const s = (t || "").toLowerCase();
  if (/logement|habitat|urbanis|loyer|foncier/.test(s)) return "logement";
  if (/énerg|energ|climat|carbone|nucl|électri|electri|renouvel/.test(s)) return "energie";
  return "numerique";
}

// Accueil : lois les plus amendées, au format LoiResume attendu par LoiCard
export async function getLoisEnCours(limit = 12): Promise<LoiResume[]> {
  const rows = await prisma.$queryRaw<
    { uid: string; titre: string; n: bigint; dep: bigint }[]
  >`
    SELECT d."uid" AS uid, d."title" AS titre,
           COUNT(a.id) AS n,
           COUNT(DISTINCT a."authorId") AS dep
    FROM "Dossier" d
    JOIN "Law" l ON l."dossierId" = d.id
    JOIN "Amendment" a ON a."lawId" = l.id
    WHERE d."uid" IS NOT NULL
    GROUP BY d."uid", d."title"
    ORDER BY n DESC
    LIMIT ${limit}
  `;

  // Un seul findMany pour tous les dossiers affichés (au lieu d'un findUnique
  // par carte, séquentiel) -> supprime le N+1 sur la home.
  const uids = rows.map((r) => r.uid);
  const dossiers = await prisma.dossier.findMany({
    where: { uid: { in: uids } },
    select: { uid: true, raw: true },
  });
  const rawByUid = new Map(dossiers.map((d) => [d.uid as string, d.raw]));

  return rows.map((r) => {
    const dp = (rawByUid.get(r.uid) as any)?.dossierParlementaire ?? {};
    const parcours = buildParcours(dp);
    const derniere = [...parcours].reverse().find((e) => e.date);
    return {
      numero: r.uid,
      titre: r.titre,
      icone: iconeFromTitre(r.titre),
      amendements: Number(r.n),
      deputesImpliques: Number(r.dep),
      derniereActualite: derniere?.date ?? "",
      etape: derniere
        ? { label: derniere.label, acteur: derniere.acteur }
        : { label: "En cours", acteur: "depot" },
    };
  });
}

// Sommaire hiérarchique simple à partir des articles réels
export function buildSommaire(articles: Article[]) {
  return [
    {
      titre: "Articles amendés",
      chapitres: [
        {
          nom: null as string | null,
          articles: articles.map((a) => `Article ${a.numero}`),
        },
      ],
    },
  ];
}
