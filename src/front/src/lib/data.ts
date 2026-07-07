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

import { cache } from "react";
import { prisma } from "./prisma";
import { texteEstPartiel } from "./ui";
import { getInfoParlementaireOfficielle, photoParlementaireUrl } from "./parlementaires";
import type {
  ProjetLoi,
  Article,
  Amendement,
  EtapeParcours,
  ActeurEtape,
  StatutAmendement,
  Depute,
  DeputeProfil,
  TexteDepose,
  VoteDepute,
  DiffLigne,
  LoiResume,
  IconeThematique,
  VersionArticle,
  GroupeStat,
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

// Certains libellés d'actes sont identiques d'une chambre à l'autre
// ("Nouvelle Lecture" pour ANNLEC comme pour SNNLEC) : on précise la chambre
// à partir du préfixe du code (AN… = Assemblée, SN… = Sénat) quand le libellé
// ne la mentionne pas déjà, pour lever l'ambiguïté du parcours.
function preciseChambre(label: string, code: string): string {
  const l = label.toLowerCase();
  if (l.includes("assemblée") || l.includes("sénat") || l.includes("senat")) return label;
  const c = code.toUpperCase();
  if (c.startsWith("AN")) return `${label} · Assemblée`;
  if (c.startsWith("SN")) return `${label} · Sénat`;
  return label;
}

// Infos de la loi officielle promulguée (n° "2026-103", date, lien Légifrance)
// extraites de l'acte PROM -> sous-acte PROM-PUB de l'open data AN.
function infosPromulgation(
  dp: any
): { numero: string; date: string; urlLegifrance?: string } | undefined {
  for (const acte of asArray(dp?.actesLegislatifs?.acteLegislatif)) {
    if (String(acte?.codeActe) !== "PROM") continue;
    const pub = asArray(acte?.actesLegislatifs?.acteLegislatif).find((a: any) => a?.codeLoi);
    if (!pub?.codeLoi) return undefined;
    return {
      numero: String(pub.codeLoi),
      date: formatDate(pub.dateActe),
      urlLegifrance: pub?.infoJO?.urlLegifrance || undefined,
    };
  }
  return undefined;
}

// Saisines du Conseil constitutionnel (acte CC -> sous-actes CC-SAISIE-*).
function infosConseilConstit(dp: any): { saisines: { date: string; par: string }[] } | undefined {
  for (const acte of asArray(dp?.actesLegislatifs?.acteLegislatif)) {
    if (String(acte?.codeActe) !== "CC") continue;
    const saisines = asArray(acte?.actesLegislatifs?.acteLegislatif)
      .filter((s: any) => String(s?.codeActe ?? "").startsWith("CC-SAISIE"))
      .map((s: any) => ({
        date: formatDate(s?.dateActe),
        par: String(s?.casSaisine?.libelle ?? "Saisine"),
      }))
      .filter((s: { date: string }) => s.date);
    if (!saisines.length) return undefined;
    return { saisines };
  }
  return undefined;
}

function buildParcours(dp: any): EtapeParcours[] {
  const actes = asArray(dp?.actesLegislatifs?.acteLegislatif);
  const etapes: EtapeParcours[] = [];
  let v = 0;

  for (const acte of actes) {
    const code = acte?.codeActe ?? "";
    const labelBrut = acte?.libelleActe?.nomCanonique ?? acte?.libelleActe?.libelleCourt ?? code ?? "Étape";
    const label = preciseChambre(String(labelBrut), String(code));
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
  alinea?: string | null;
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
  UDDPLR: "#0f2d52",
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
  ECOS: "#22c55e",
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

// Libellé complet des groupes (abréviation AN -> nom) pour la fiche député.
const GROUPE_LIBELLE: Record<string, string> = {
  RN: "Rassemblement National",
  UDR: "Union des droites pour la République",
  UDDPLR: "Union des droites pour la République",
  DR: "Droite Républicaine",
  LR: "Les Républicains",
  EPR: "Ensemble pour la République",
  RE: "Renaissance",
  ENS: "Ensemble pour la République",
  DEM: "Les Démocrates",
  HOR: "Horizons & Indépendants",
  LIOT: "Libertés, Indépendants, Outre-mer et Territoires",
  SOC: "Socialistes et apparentés",
  EcoS: "Écologiste et Social",
  ECOS: "Écologiste et Social",
  ECO: "Écologiste et Social",
  "LFI-NFP": "La France insoumise — Nouveau Front Populaire",
  LFI: "La France insoumise",
  GDR: "Gauche Démocrate et Républicaine",
  NI: "Non inscrits",
};

export type DeputeMap = Map<
  string,
  { name: string; group: string | null; photoUrl?: string; institution?: "assemblee" | "senat" }
>;

// Un identifiant d'auteur exploitable est purement alphanumérique (ex. "PA1592").
// L'open data AN contient parfois un placeholder XML nil importé tel quel
// ({"@xsi:nil":"true",…}) : on le rejette pour ne pas afficher ce charabia.
function refPropre(id: string | null | undefined): id is string {
  return !!id && /^[A-Za-z0-9]+$/.test(id);
}

function deputeFromId(id: string | null | undefined, deputes: DeputeMap): Depute {
  const ref = refPropre(id) ? id : null;
  const dep = ref ? deputes.get(ref) : undefined;
  const photoUrl = ref ? dep?.photoUrl ?? photoParlementaireUrl(ref) : undefined;

  return {
    id: ref ?? "?",
    nom: dep?.name ?? (ref ? `Réf. ${ref}` : "Auteur inconnu"),
    groupe: dep?.group ?? "",
    couleur: couleurGroupe(dep?.group ?? null),
    photoUrl,
    institution: dep?.institution ?? (/^PA\d+$/.test(ref ?? "") ? "assemblee" : undefined),
  };
}

// Dispositif lisible (prose) de l'amendement, borné pour rester léger à afficher.
// On NE synthétise PAS de diff rouge/vert à partir de cette prose : extraire des
// fragments entre guillemets hors de leur instruction ("substituer « X » par « Y »
// à l'alinéa 8") produit un pseudo-diff trompeur, introuvable dans le texte
// affiché. On restitue donc l'instruction officielle telle quelle.
function dispositifFromContent(content: string | null | undefined): string | undefined {
  const t = stripHtml(content);
  if (!t) return undefined;
  return t.length > 1500 ? t.slice(0, 1500).trimEnd() + "…" : t;
}

function mapAmendement(a: AmendmentRow, deputes: DeputeMap): Amendement {
  const auteur = deputeFromId(a.authorId, deputes);
  return {
    uid: a.uid,
    numero: a.numeroLong ?? a.numeroOrdreDepot ?? "?",
    auteur,
    statut: toStatut(a.status, a.sort),
    alinea: a.alinea ?? undefined,
    dateDepot: formatDate(a.dateDepot?.toISOString()),
    dateAdoption: a.status === "ACCEPTED" ? formatDate(a.dateSort?.toISOString()) : undefined,
    dispositif: dispositifFromContent(a.content),
  };
}

// bornes pour garder un payload raisonnable côté client
const MAX_ARTICLES = 60;
const MAX_HISTO = 200;

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

// Mémoïsé par requête (React cache) : la page loi ET son generateMetadata
// l'appellent — on ne veut pas payer deux fois cette reconstruction lourde.
export const getProjetLoi = cache(async function getProjetLoi(
  dossierUid: string
): Promise<ProjetLoi | null> {
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
      alinea: true,
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
  const authorIds = [...new Set(amendements.map((a) => a.authorId).filter(refPropre))];
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
  // pour un numéro d'article : diff entre 1ère et dernière version COMPLÈTE qui le
  // contiennent (on écarte les textes de séance en marqueurs « (Non modifiée) »,
  // qui produiraient un faux « tout supprimé »).
  function diffTexteArticle(num: string): { diff: DiffLigne[]; avant: string; apres: string } | null {
    const withArt = versionsIdx.filter((v) => v.byNum.has(num) && !texteEstPartiel(v.byNum.get(num)));
    if (withArt.length < 2) return null;
    const premiere = withArt[0];
    const derniere = withArt[withArt.length - 1];
    const a = premiere.byNum.get(num)!;
    const b = derniere.byNum.get(num)!;
    if (a.join("\n") === b.join("\n")) return null; // pas de changement
    return { diff: diffLines(a, b), avant: premiere.label, apres: derniere.label };
  }

  // vrai texte de l'article : dernière version COMPLÈTE (consolidée) qui le
  // contient, à défaut la dernière disponible.
  function texteArticle(num: string): string | null {
    const withArt = versionsIdx.filter((v) => v.byNum.has(num));
    if (!withArt.length) return null;
    const completes = withArt.filter((v) => !texteEstPartiel(v.byNum.get(num)));
    const source = completes.length ? completes : withArt;
    return source[source.length - 1].byNum.get(num)!.join("\n\n");
  }

  // (versionsTexte est désormais chargé à la demande via getArticleDetail —
  //  cf. commentaire dans le retour d'article ci-dessous)

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
        amendementActuel: dernierAdopte ? mapAmendement(dernierAdopte, deputes) : undefined,
        // historique + influenceurs + versionsTexte NE sont PAS dans le payload
        // initial : ils ne servent que pour l'article actif (après sélection
        // d'une étape) et pesaient l'essentiel des ~3 Mo (dont ~1,6 Mo de texte
        // de loi). Chargés à la demande via getArticleDetail() / GET /api/article.
        historique: [],
        influenceurs: [],
        diffTexte: dt?.diff,
        diffTexteInfo: dt ? { avant: dt.avant, apres: dt.apres } : undefined,
        versionsTexte: undefined,
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
        art.amendementActuel.dispositif = dispositifFromContent(c);
      }
    }
  }

  const adoptes = amendements.filter((a) => a.status === "ACCEPTED").length;
  const auteurs = new Set(amendements.map((a) => a.authorId).filter(refPropre));

  // Répartition des amendements par groupe politique (auteurs identifiés en base).
  // Agrégée en SQL pour couvrir TOUS les amendements du dossier, pas seulement
  // les ~60 affichés.
  const groupesRows = await prisma.$queryRaw<{ groupe: string | null; total: bigint; adoptes: bigint }[]>`
    SELECT dep."group" AS groupe,
           COUNT(a.id) AS total,
           COUNT(a.id) FILTER (WHERE a."status" = 'ACCEPTED') AS adoptes
    FROM "Amendment" a
    JOIN "Law" l ON a."lawId" = l.id
    JOIN "Deputy" dep ON dep."uid" = a."authorId"
    WHERE l."dossierId" = ${dossier.id} AND dep."group" IS NOT NULL
    GROUP BY dep."group"
    ORDER BY total DESC
  `;
  const repartitionGroupes: GroupeStat[] = groupesRows.map((r) => ({
    groupe: r.groupe as string,
    libelle: (r.groupe && GROUPE_LIBELLE[r.groupe]) || (r.groupe as string),
    couleur: couleurGroupe(r.groupe),
    total: Number(r.total),
    adoptes: Number(r.adoptes),
  }));

  // Scrutins publics rattachés à ce dossier (dataset AN "Scrutins").
  const scrutinsRows = await prisma.scrutin.findMany({
    where: { dossierUid },
    orderBy: { dateScrutin: "asc" },
    select: {
      uid: true, numero: true, dateScrutin: true, titre: true,
      sortCode: true, sortLibelle: true, pour: true, contre: true, abstention: true,
    },
  });
  const scrutins = scrutinsRows.map((s) => ({
    uid: s.uid,
    numero: s.numero ?? undefined,
    date: formatDate(s.dateScrutin?.toISOString()),
    titre: s.titre ?? "Scrutin public",
    adopte: (s.sortCode ?? "").toLowerCase().includes("adopt"),
    sortLibelle: s.sortLibelle ?? undefined,
    pour: s.pour ?? 0,
    contre: s.contre ?? 0,
    abstention: s.abstention ?? 0,
  }));

  const premiereDate = parcours.find((e) => e.date)?.date ?? "";
  const derniereEtape = [...parcours].reverse().find((e) => e.date);

  // Statut RÉEL déduit du parcours (et non figé à "En cours") : une loi dont
  // l'étape de promulgation/adoption est franchie n'est plus "en cours".
  const etapesFaites = parcours.filter((e) => e.fait);
  const aPromulgation = etapesFaites.some((e) => e.acteur === "promulgation");
  const aAdoption = etapesFaites.some((e) => e.acteur === "adoption");
  let statut: string;
  let statutVariant: "termine" | "encours" | "depose";
  if (aPromulgation) {
    statut = "Promulguée";
    statutVariant = "termine";
  } else if (aAdoption) {
    statut = "Adoptée";
    statutVariant = "termine";
  } else if (dp?.actesLegislatifs) {
    statut = "En cours de procédure";
    statutVariant = "encours";
  } else {
    statut = "Déposé";
    statutVariant = "depose";
  }

  // lien vers le dossier officiel AN (via titreChemin + législature)
  const legislature = dp?.legislature ?? dossier.uid?.match(/L(\d+)N/)?.[1] ?? "17";
  const chemin = dp?.titreDossier?.titreChemin ?? dossier.uid;
  const dossierUrl = chemin
    ? `https://www.assemblee-nationale.fr/dyn/${legislature}/dossiers/${chemin}`
    : undefined;

  const ref = refDepot(dp);
  const typeTexte = typeDossier(dossier.title ?? "");

  return {
    numero: dossier.uid ?? dossier.id,
    // numéro officiel de dépôt (ex. 108), pas l'identifiant technique du dossier.
    numeroAffiche: ref.numero ?? dossier.uid?.match(/N(\d+)/)?.[1] ?? dossier.uid ?? "",
    type: typeTexte,
    chambreOrigine: ref.chambre ?? undefined,
    dossierUrl,
    titre: dossier.title ?? "Dossier législatif",
    statut,
    statutVariant,
    dateDepot: premiereDate,
    datePromulgation:
      parcours.find((e) => e.acteur === "promulgation")?.date ?? "",
    loiPromulguee: infosPromulgation(dp),
    conseilConstit: infosConseilConstit(dp),
    version: derniereEtape?.version ?? "v1.0",
    parcours,
    stats: {
      amendements: amendements.length,
      amendementsAdoptes: adoptes,
      deputesImpliques: auteurs.size,
      deputesTotal: 577,
      votes: scrutins.length,
      heuresDebat: 0, // dataset débats non importé
    },
    repartitionGroupes,
    scrutins,
    articles,
  };
});

function mandatAssemblee(acteur: any): any {
  return asArray(acteur?.mandats?.mandat).find((m) => m?.typeOrgane === "ASSEMBLEE");
}

// "Gironde (4e circonscription)" à partir de election.lieu (1re, 2e, 3e…)
function libelleCirconscription(mandat: any): string | undefined {
  const lieu = mandat?.election?.lieu;
  if (!lieu?.departement) return undefined;
  const n = lieu.numCirco;
  const ordinal = n ? (n === "1" ? "1re" : `${n}e`) : "";
  const circo = ordinal ? ` (${ordinal} circonscription)` : "";
  return `${lieu.departement}${circo}`;
}

// Titre institutionnel le plus prestigieux ACTIF du député (dateFin nulle).
// On ignore les groupes d'amitié (GA) / d'études (GE), non significatifs ici.
// Renvoie undefined pour un simple membre (rien à afficher).
function fonctionInstitutionnelle(acteur: any, feminin: boolean): string | undefined {
  const mandats = asArray(acteur?.mandats?.mandat).filter((m) => !m?.dateFin);
  const qualite = (m: any) => (m?.infosQualite?.libQualite ?? "").toLowerCase();
  const has = (org: string, pred: (q: string) => boolean) =>
    mandats.some((m) => m?.typeOrgane === org && pred(qualite(m)));

  const vp = feminin ? "Vice-présidente" : "Vice-président";
  const pr = feminin ? "Présidente" : "Président";

  // BUREAU = bureau de l'Assemblée (Président·e / Vice-président·e de l'AN)
  if (has("BUREAU", (q) => q.startsWith("président") && q.includes("assemblée")))
    return `${pr} de l'Assemblée nationale`;
  if (has("BUREAU", (q) => q.startsWith("vice-président") && q.includes("assemblée")))
    return `${vp} de l'Assemblée nationale`;
  // GP = groupe politique
  if (has("GP", (q) => q.startsWith("président"))) return `${pr} de groupe`;
  // COMPER = commission permanente
  if (has("COMPER", (q) => q.startsWith("président"))) return `${pr} de commission`;
  if (has("GP", (q) => q.startsWith("vice-président"))) return `${vp} de groupe`;
  if (has("COMPER", (q) => q.startsWith("vice-président"))) return `${vp} de commission`;
  return undefined;
}

// Type de dossier lisible, déduit de son intitulé (l'open data ne fournit pas de code type fiable).
function typeDossier(titre: string): string {
  const t = titre.toLowerCase();
  if (t.startsWith("proposition de loi")) return "Proposition de loi";
  if (t.startsWith("proposition de résolution")) return "Proposition de résolution";
  if (t.startsWith("projet de loi")) return "Projet de loi";
  return "Texte déposé";
}

// Numéro officiel + chambre d'origine, lus dans l'acte de dépôt INITIAL du
// dossier. Le vrai numéro (ex. 108) est le suffixe « B0*NNN » du texteAssocie
// du 1er dépôt — il diffère de l'identifiant technique du dossier (…N50819).
// La chambre d'origine vient du code de l'acte (AN1-DEPOT / SN1-DEPOT) : un
// texte né au Sénat porte un numéro Sénat, d'où l'intérêt de le préciser.
function refDepot(dp: unknown): { numero: string | null; chambre: string | null } {
  const depots: { date: string; code: string; texte: string }[] = [];
  (function walk(o: unknown) {
    if (o && typeof o === "object") {
      if (!Array.isArray(o)) {
        const acte = o as Record<string, unknown>;
        if (typeof acte.codeActe === "string" && acte.codeActe.includes("DEPOT")) {
          depots.push({
            date: String(acte.dateActe ?? ""),
            code: acte.codeActe,
            texte: String(acte.texteAssocie ?? ""),
          });
        }
      }
      for (const v of Object.values(o as Record<string, unknown>)) walk(v);
    }
  })(dp);
  depots.sort((a, b) => (a.date < b.date ? -1 : 1));
  const first = depots[0];
  if (!first) return { numero: null, chambre: null };
  const m = first.texte.match(/B0*(\d+)/);
  const chambre = first.code.startsWith("SN")
    ? "Sénat"
    : first.code.startsWith("AN")
      ? "Assemblée nationale"
      : null;
  return { numero: m ? m[1] : null, chambre };
}

export const getDepute = cache(async function getDepute(
  uid: string
): Promise<DeputeProfil | null> {
  const row = await prisma.deputy.findUnique({
    where: { uid },
    select: { uid: true, name: true, group: true, raw: true },
  });
  if (!row) return null;

  const acteur = (row.raw as any)?.acteur ?? {};
  const ident = acteur?.etatCivil?.ident ?? {};
  const prenom = ident.prenom ?? "";
  const nomFamille = ident.nom ?? "";
  const nomComplet = [prenom, nomFamille].filter(Boolean).join(" ") || row.name;

  const mandat = mandatAssemblee(acteur);
  const dateDebutIso = mandat?.mandature?.datePriseFonction ?? mandat?.dateDebut ?? undefined;
  const feminin = (ident.civ ?? "") === "Mme";
  const fonction = fonctionInstitutionnelle(acteur, feminin);

  const group = row.group ?? null;

  // --- Amendements récents (les plus récents d'abord) ---
  const amendementsRows = await prisma.amendment.findMany({
    where: { authorId: uid },
    select: {
      uid: true,
      numeroLong: true,
      numeroOrdreDepot: true,
      alinea: true,
      article: true,
      status: true,
      sort: true,
      dateDepot: true,
      dateSort: true,
      authorId: true,
      law: { select: { dossier: { select: { uid: true, title: true } } } },
    },
    orderBy: { dateDepot: "desc" },
    take: 20,
  });

  // total + adoptés (compteur global, séparé de la liste bornée à 20)
  const [totalAmdt, totalAdoptes] = await Promise.all([
    prisma.amendment.count({ where: { authorId: uid } }),
    prisma.amendment.count({ where: { authorId: uid, status: "ACCEPTED" } }),
  ]);

  // Activité : amendements déposés par mois (frise).
  const activiteRows = await prisma.$queryRaw<{ mois: string; n: bigint }[]>`
    SELECT to_char(date_trunc('month', "dateDepot"), 'YYYY-MM') AS mois, COUNT(*) AS n
    FROM "Amendment"
    WHERE "authorId" = ${uid} AND "dateDepot" IS NOT NULL
    GROUP BY 1 ORDER BY 1 ASC
  `;
  const MOIS_COURT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const activite = activiteRows.map((r) => {
    const [y, m] = r.mois.split("-");
    return { mois: r.mois, libelle: `${MOIS_COURT[parseInt(m, 10) - 1]} ${y.slice(2)}`, total: Number(r.n) };
  });

  // Bilan des positions de vote (tous scrutins publics) + votes récents.
  const [bilanRows, votesRows] = await Promise.all([
    prisma.$queryRaw<{ position: string; n: bigint }[]>`
      SELECT position, COUNT(*) AS n FROM "ScrutinVote" WHERE "acteurRef" = ${uid} GROUP BY position
    `,
    prisma.$queryRaw<{ position: string; titre: string | null; date: Date | null; sortCode: string | null; dossierUid: string | null }[]>`
      SELECT sv.position, s.titre, s."dateScrutin" AS date, s."sortCode", s."dossierUid"
      FROM "ScrutinVote" sv JOIN "Scrutin" s ON s.uid = sv."scrutinUid"
      WHERE sv."acteurRef" = ${uid}
      ORDER BY s."dateScrutin" DESC NULLS LAST
      LIMIT 15
    `,
  ]);
  const bilan = { pour: 0, contre: 0, abstention: 0, nonVotant: 0 };
  for (const r of bilanRows) {
    const n = Number(r.n);
    if (r.position === "pour") bilan.pour = n;
    else if (r.position === "contre") bilan.contre = n;
    else if (r.position === "abstention") bilan.abstention = n;
    else if (r.position === "nonVotant") bilan.nonVotant = n;
  }
  const totalVotes = bilan.pour + bilan.contre + bilan.abstention + bilan.nonVotant;
  const POSITION_LABEL: Record<string, VoteDepute["position"]> = {
    pour: "Pour", contre: "Contre", abstention: "Abstention", nonVotant: "Non-votant",
  };
  const votes: VoteDepute[] = votesRows.map((r) => ({
    objet: r.titre ?? "Scrutin public",
    position: POSITION_LABEL[r.position] ?? "Abstention",
    date: formatDate(r.date?.toISOString()),
    adopte: (r.sortCode ?? "").toLowerCase().includes("adopt"),
    loiUid: r.dossierUid ?? undefined,
  }));

  // le député lui-même comme auteur (nom + couleur cohérents avec la fiche)
  const selfDepute: DeputeMap = new Map([
    [
      uid,
      { name: nomComplet, group, photoUrl: photoParlementaireUrl(uid), institution: "assemblee" as const },
    ],
  ]);
  const derniersAmendements = amendementsRows.map((a) => ({
    ...mapAmendement(a as AmendmentRow, selfDepute),
    dossierUid: a.law?.dossier?.uid ?? undefined,
    dossierTitre: a.law?.dossier?.title ?? undefined,
  }));

  // --- Textes déposés (dossiers dont il est initiateur) ---
  // Le filtrage se fait EN SQL : on déplie initiateur.acteurs.acteur (objet OU
  // tableau, d'où le jsonb_typeof) et on ne remonte QUE les uid des dossiers
  // concernés + leur nb d'amendements. On ne rapatrie jamais les gros blobs raw
  // de tous les dossiers (ce qui saturait la connexion).
  const initiesRows = await prisma.$queryRaw<{ uid: string; title: string | null; n: bigint }[]>`
    SELECT d."uid" AS uid, d."title" AS title, COUNT(a.id) AS n
    FROM "Dossier" d
    LEFT JOIN "Law" l ON l."dossierId" = d.id
    LEFT JOIN "Amendment" a ON a."lawId" = l.id
    WHERE d."uid" IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(
          CASE jsonb_typeof(d."raw"->'dossierParlementaire'->'initiateur'->'acteurs'->'acteur')
            WHEN 'array'  THEN d."raw"->'dossierParlementaire'->'initiateur'->'acteurs'->'acteur'
            WHEN 'object' THEN jsonb_build_array(d."raw"->'dossierParlementaire'->'initiateur'->'acteurs'->'acteur')
            ELSE '[]'::jsonb
          END
        ) elem
        WHERE elem->>'acteurRef' = ${uid}
      )
    GROUP BY d."uid", d."title"
  `;

  // Dates : on ne relit le raw QUE des dossiers retenus (petit nombre) pour
  // reconstruire la date de dépôt via le parcours.
  const initiesUids = initiesRows.map((r) => r.uid);
  const rawByUid = new Map<string, any>();
  if (initiesUids.length) {
    for (const d of await prisma.dossier.findMany({
      where: { uid: { in: initiesUids } },
      select: { uid: true, raw: true },
    })) {
      rawByUid.set(d.uid as string, d.raw);
    }
  }
  const textesDeposes: TexteDepose[] = initiesRows
    .map((r) => {
      const dp = (rawByUid.get(r.uid) as any)?.dossierParlementaire ?? {};
      const parcours = buildParcours(dp);
      const titre = r.title ?? "Dossier législatif";
      return {
        uid: r.uid,
        titre,
        type: typeDossier(titre),
        date: parcours.find((e) => e.date)?.date ?? "",
        amendements: Number(r.n),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return {
    id: uid,
    nom: nomComplet,
    prenom,
    nomFamille,
    civilite: ident.civ ?? "",
    groupe: group ?? "",
    groupeLibelle: group ? GROUPE_LIBELLE[group] : undefined,
    couleur: couleurGroupe(group),
    photoUrl: photoParlementaireUrl(uid),
    circonscription: libelleCirconscription(mandat),
    dateDebutMandat: formatDate(dateDebutIso),
    dateDebutMandatIso: typeof dateDebutIso === "string" ? dateDebutIso : undefined,
    premiereElection: mandat?.mandature?.premiereElection === "1",
    fonction,
    stats: {
      amendements: totalAmdt,
      amendementsAdoptes: totalAdoptes,
      textesDeposes: textesDeposes.length,
      votes: totalVotes,
    },
    derniersAmendements,
    textesDeposes,
    votes,
    bilanVotes: totalVotes > 0 ? bilan : undefined,
    activite,
  };
});

// Détail d'UN article, chargé à la demande (l'historique + les influenceurs ne
// sont pas dans le payload initial de getProjetLoi -> gros gain de poids de page).
// On ne résout les auteurs (y compris fallback réseau) que pour cet article.
export async function getArticleDetail(
  dossierUid: string,
  numero: string
): Promise<{
  historique: Amendement[];
  totalHistorique: number; // nb réel d'amendements sur l'article (≥ historique.length, qui est plafonné)
  influenceurs: { depute: Depute; part: number }[];
  versionsTexte: VersionArticle[];
} | null> {
  const dossier = await prisma.dossier.findUnique({
    where: { uid: dossierUid },
    select: { id: true },
  });
  if (!dossier) return null;

  // versions datées du texte de CET article (pour lier le texte au parcours) —
  // sorties du payload initial (le JSON LawText pèse ~1,6 Mo par dossier).
  const lawTexts = await prisma.lawText.findMany({
    where: { dossierUid },
    orderBy: { ordre: "asc" },
    select: { label: true, articles: true, ordre: true, date: true },
  });
  const versionsTexte: VersionArticle[] = lawTexts
    .map((v, i) => {
      let base = v.label;
      if (base === "Texte déposé" && i > 0) base = "Texte transmis (navette)";
      const d = formatDate(v.date ?? undefined);
      const alineas = indexByNum(v.articles as Record<string, string[]>).get(numero);
      return { label: d ? `${base} (${d})` : base, dateIso: v.date ?? "", alineas };
    })
    .filter((v): v is { label: string; dateIso: string; alineas: string[] } => !!v.alineas);

  const amendements = await prisma.amendment.findMany({
    where: { law: { dossierId: dossier.id } },
    select: {
      uid: true,
      numeroLong: true,
      numeroOrdreDepot: true,
      alinea: true,
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
  if (!rows.length) return { historique: [], totalHistorique: 0, influenceurs: [], versionsTexte };

  // résolution des auteurs pour CET article seulement (≤ quelques dizaines)
  const authorIds = [...new Set(rows.map((a) => a.authorId).filter(refPropre))];
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

  // Dispositif (content) chargé UNIQUEMENT pour les amendements réellement
  // affichés (≤ MAX_HISTO), pas pour tous ceux du dossier -> permet un diff
  // rouge/vert quand la formulation est reconnue, sinon un repli lisible.
  const histoRows = rows.slice(0, MAX_HISTO);
  const histoUids = histoRows.map((r) => r.uid).filter(Boolean) as string[];
  const contentByUid = histoUids.length
    ? new Map(
        (
          await prisma.amendment.findMany({
            where: { uid: { in: histoUids } },
            select: { uid: true, content: true },
          })
        ).map((c) => [c.uid, c.content])
      )
    : new Map<string, string | null>();
  const historique = histoRows.map((r) =>
    mapAmendement({ ...r, content: r.uid ? contentByUid.get(r.uid) : null }, deputes)
  );

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

  return { historique, totalHistorique: rows.length, influenceurs, versionsTexte };
}

// Annuaire des députés (législature 17) avec leur volume d'amendements.
export type DeputeListItem = {
  uid: string;
  nom: string;
  groupe: string;
  groupeLibelle?: string;
  couleur: string;
  photoUrl?: string;
  amendements: number;
  adoptes: number;
};

export const getDeputes = cache(async function getDeputes(): Promise<DeputeListItem[]> {
  const rows = await prisma.$queryRaw<
    { uid: string; name: string; group: string | null; n: bigint; adoptes: bigint }[]
  >`
    SELECT d."uid" AS uid, d."name" AS name, d."group" AS "group",
           COUNT(a.id) AS n,
           COUNT(a.id) FILTER (WHERE a."status" = 'ACCEPTED') AS adoptes
    FROM "Deputy" d
    LEFT JOIN "Amendment" a ON a."authorId" = d."uid"
    GROUP BY d."uid", d."name", d."group"
    ORDER BY n DESC, d."name" ASC
  `;
  return rows.map((r) => ({
    uid: r.uid,
    nom: r.name,
    groupe: r.group ?? "",
    groupeLibelle: r.group ? GROUPE_LIBELLE[r.group] : undefined,
    couleur: couleurGroupe(r.group),
    photoUrl: photoParlementaireUrl(r.uid),
    amendements: Number(r.n),
    adoptes: Number(r.adoptes),
  }));
});

// Détail d'un amendement (page /amendement/[id]).
export const getAmendement = cache(async function getAmendement(
  uid: string
): Promise<import("./types").AmendementDetail | null> {
  const a = await prisma.amendment.findUnique({
    where: { uid },
    select: {
      uid: true,
      numeroLong: true,
      numeroOrdreDepot: true,
      article: true,
      alinea: true,
      content: true,
      exposeSommaire: true,
      cosignataires: true,
      status: true,
      sort: true,
      dateDepot: true,
      dateSort: true,
      authorId: true,
      law: { select: { dossier: { select: { uid: true, title: true } } } },
    },
  });
  if (!a) return null;

  const deputes: DeputeMap = new Map();
  if (refPropre(a.authorId)) {
    const dep = await prisma.deputy.findUnique({
      where: { uid: a.authorId },
      select: { uid: true, name: true, group: true },
    });
    if (dep) {
      deputes.set(dep.uid as string, {
        name: dep.name,
        group: dep.group,
        photoUrl: photoParlementaireUrl(dep.uid as string),
        institution: /^PA\d+$/.test(dep.uid as string) ? "assemblee" : undefined,
      });
    } else {
      const info = await getInfoParlementaireOfficielle(a.authorId);
      if (info.nom || info.photoUrl)
        deputes.set(info.id, { name: info.nom ?? `Réf. ${info.id}`, group: null, photoUrl: info.photoUrl, institution: info.source });
    }
  }

  // Résolution des cosignataires (noms + groupe) en une requête.
  const cosignIds = (a.cosignataires ?? []).filter(refPropre);
  if (cosignIds.length) {
    const rows = await prisma.deputy.findMany({
      where: { uid: { in: cosignIds } },
      select: { uid: true, name: true, group: true },
    });
    for (const d of rows)
      deputes.set(d.uid as string, {
        name: d.name,
        group: d.group,
        photoUrl: photoParlementaireUrl(d.uid as string),
        institution: /^PA\d+$/.test(d.uid as string) ? "assemblee" : undefined,
      });
  }
  const cosignataires = cosignIds.map((id) => deputeFromId(id, deputes));

  return {
    uid: a.uid,
    numero: a.numeroLong ?? a.numeroOrdreDepot ?? "?",
    auteur: deputeFromId(a.authorId, deputes),
    statut: toStatut(a.status, a.sort),
    sort: a.sort ?? undefined,
    article: a.article ?? undefined,
    alinea: a.alinea ?? undefined,
    dateDepot: formatDate(a.dateDepot?.toISOString()),
    dateSort: a.dateSort ? formatDate(a.dateSort.toISOString()) : undefined,
    dispositif: dispositifFromContent(a.content),
    exposeSommaire: a.exposeSommaire ?? undefined,
    cosignataires,
    dossierUid: a.law?.dossier?.uid ?? undefined,
    dossierTitre: a.law?.dossier?.title ?? undefined,
  };
});

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
    const ref = refDepot(dp);
    return {
      numero: r.uid,
      numeroAffiche: ref.numero ?? r.uid.match(/N(\d+)/)?.[1] ?? r.uid,
      type: typeDossier(r.titre),
      chambre: ref.chambre ?? undefined,
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

// Registre législatif COMPLET, paginé : tous les dossiers (avec titre), triés par
// volume d'amendements, recherche optionnelle sur le titre.
export type PageDossiers = {
  items: LoiResume[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export async function getDossiersPage({
  page = 1,
  perPage = 24,
  q = "",
}: {
  page?: number;
  perPage?: number;
  q?: string;
}): Promise<PageDossiers> {
  const like = q.trim() ? `%${q.trim()}%` : "%";
  const [{ c: total }] = await prisma.$queryRaw<{ c: number }[]>`
    SELECT COUNT(*)::int AS c
    FROM "Dossier" d
    WHERE d."uid" IS NOT NULL AND d."title" IS NOT NULL AND d."title" ILIKE ${like}
  `;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const offset = (pageSafe - 1) * perPage;

  const rows = await prisma.$queryRaw<{ uid: string; titre: string; n: bigint; dep: bigint }[]>`
    SELECT d."uid" AS uid, d."title" AS titre,
           COUNT(a.id) AS n,
           COUNT(DISTINCT a."authorId") AS dep
    FROM "Dossier" d
    LEFT JOIN "Law" l ON l."dossierId" = d.id
    LEFT JOIN "Amendment" a ON a."lawId" = l.id
    WHERE d."uid" IS NOT NULL AND d."title" IS NOT NULL AND d."title" ILIKE ${like}
    GROUP BY d."uid", d."title"
    ORDER BY n DESC, d."title" ASC
    OFFSET ${offset} LIMIT ${perPage}
  `;

  const uids = rows.map((r) => r.uid);
  const dossiers = uids.length
    ? await prisma.dossier.findMany({ where: { uid: { in: uids } }, select: { uid: true, raw: true } })
    : [];
  const rawByUid = new Map(dossiers.map((d) => [d.uid as string, d.raw]));

  const items: LoiResume[] = rows.map((r) => {
    const dp = (rawByUid.get(r.uid) as any)?.dossierParlementaire ?? {};
    const parcours = buildParcours(dp);
    const derniere = [...parcours].reverse().find((e) => e.date);
    const ref = refDepot(dp);
    return {
      numero: r.uid,
      numeroAffiche: ref.numero ?? r.uid.match(/N(\d+)/)?.[1] ?? r.uid,
      type: typeDossier(r.titre),
      chambre: ref.chambre ?? undefined,
      titre: r.titre,
      icone: iconeFromTitre(r.titre),
      amendements: Number(r.n),
      deputesImpliques: Number(r.dep),
      derniereActualite: derniere?.date ?? "",
      etape: derniere ? { label: derniere.label, acteur: derniere.acteur } : { label: "Déposé", acteur: "depot" },
    };
  });

  return { items, total, page: pageSafe, perPage, totalPages };
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
