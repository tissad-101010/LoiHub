"use client";
import { useState } from "react";
import { DiffLigne } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Diff mot-à-mot (intra-ligne), façon GitHub                          */
/* ------------------------------------------------------------------ */

type Seg = { t: string; chg: boolean };

function tokenize(s: string): string[] {
  // Jetons = mots, ponctuation ET espaces (gardés pour préserver l'espacement).
  // On sépare la ponctuation des mots pour un alignement plus fin
  // (« 351-8, » -> « 351-8 » + « , »).
  return s.split(/(\s+|[.,;:«»()])/).filter((t) => t !== "");
}

// LCS sur les mots : renvoie, pour chaque côté, les segments changés vs communs,
// plus un ratio de similarité (0 = rien en commun, 1 = identique).
//
// On rogne d'abord le préfixe et le suffixe communs : cela garantit que les
// portions de début/fin identiques ne sont JAMAIS surlignées (supprime le bruit
// type « avant » marqué à tort) et réduit la taille du calcul LCS.
function wordDiff(a: string, b: string): { left: Seg[]; right: Seg[]; ratio: number } {
  const A0 = tokenize(a);
  const B0 = tokenize(b);
  const origMax = Math.max(A0.length, B0.length, 1);

  let lo = 0;
  while (lo < A0.length && lo < B0.length && A0[lo] === B0[lo]) lo++;
  let hiA = A0.length;
  let hiB = B0.length;
  while (hiA > lo && hiB > lo && A0[hiA - 1] === B0[hiB - 1]) {
    hiA--;
    hiB--;
  }

  const prefixe = A0.slice(0, lo);
  const suffixe = A0.slice(hiA);
  const A = A0.slice(lo, hiA);
  const B = B0.slice(lo, hiB);
  const n = A.length;
  const m = B.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);

  const midLeft: Seg[] = [];
  const midRight: Seg[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      midLeft.push({ t: A[i], chg: false });
      midRight.push({ t: B[j], chg: false });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      midLeft.push({ t: A[i], chg: true });
      i++;
    } else {
      midRight.push({ t: B[j], chg: true });
      j++;
    }
  }
  while (i < n) midLeft.push({ t: A[i++], chg: true });
  while (j < m) midRight.push({ t: B[j++], chg: true });

  const commun = prefixe.map((t) => ({ t, chg: false }));
  const suff = suffixe.map((t) => ({ t, chg: false }));
  const left = [...commun, ...midLeft, ...suff];
  const right = [...commun, ...midRight, ...suff];

  const communTotal = lo + (A0.length - hiA) + dp[0][0];
  const ratio = communTotal / origMax;
  return { left, right, ratio };
}

/* ------------------------------------------------------------------ */
/* Regroupement en lignes gauche/droite                                */
/* ------------------------------------------------------------------ */

type Cell = { texte: string; type: "supprime" | "ajoute" | "inchange"; segs?: Seg[] } | null;
type Row = { left: Cell; right: Cell; change: boolean };

// Seuil de similarité au-dessus duquel deux alinéas (un retiré + un ajouté) sont
// considérés comme « la même ligne modifiée » -> surlignage mot-à-mot.
const SIMILAIRE = 0.5;

// Appariement d'un bloc de lignes retirées / ajoutées PAR SIMILARITÉ (pas par
// position), façon GitHub : on aligne une ligne retirée avec la ligne ajoutée
// qui lui ressemble le plus, même si d'autres lignes ont été insérées entre les
// deux. Évite d'afficher « tout supprimé + tout réajouté » pour un paragraphe
// simplement reformulé ou déplacé. LCS maximisant la similarité totale, l'ordre
// étant préservé.
function apparier(dels: DiffLigne[], adds: DiffLigne[]): { d?: DiffLigne; a?: DiffLigne }[] {
  const n = dels.length;
  const m = adds.length;
  if (!n || !m) return [...dels.map((d) => ({ d })), ...adds.map((a) => ({ a }))];

  const sim: number[][] = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) sim[i][j] = wordDiff(dels[i].texte, adds[j].texte).ratio;

  const score: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) {
      const match = sim[i][j] >= SIMILAIRE ? sim[i][j] + score[i + 1][j + 1] : -Infinity;
      score[i][j] = Math.max(match, score[i + 1][j], score[i][j + 1]);
    }

  const out: { d?: DiffLigne; a?: DiffLigne }[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    const match = sim[i][j] >= SIMILAIRE ? sim[i][j] + score[i + 1][j + 1] : -Infinity;
    if (match >= score[i + 1][j] && match >= score[i][j + 1]) {
      out.push({ d: dels[i], a: adds[j] });
      i++;
      j++;
    } else if (score[i + 1][j] >= score[i][j + 1]) {
      out.push({ d: dels[i++] });
    } else {
      out.push({ a: adds[j++] });
    }
  }
  while (i < n) out.push({ d: dels[i++] });
  while (j < m) out.push({ a: adds[j++] });
  return out;
}

function toRows(diff: DiffLigne[]): Row[] {
  const rows: Row[] = [];
  let dels: DiffLigne[] = [];
  let adds: DiffLigne[] = [];

  const flush = () => {
    for (const { d, a } of apparier(dels, adds)) {
      let leftSegs: Seg[] | undefined;
      let rightSegs: Seg[] | undefined;
      // paire appariée -> diff mot-à-mot pour ne surligner que ce qui change
      if (d && a) {
        const wd = wordDiff(d.texte, a.texte);
        leftSegs = wd.left;
        rightSegs = wd.right;
      }
      rows.push({
        left: d ? { texte: d.texte, type: "supprime", segs: leftSegs } : null,
        right: a ? { texte: a.texte, type: "ajoute", segs: rightSegs } : null,
        change: true,
      });
    }
    dels = [];
    adds = [];
  };

  for (const l of diff) {
    if (l.type === "inchange") {
      flush();
      rows.push({
        left: { texte: l.texte, type: "inchange" },
        right: { texte: l.texte, type: "inchange" },
        change: false,
      });
    } else if (l.type === "supprime") dels.push(l);
    else adds.push(l);
  }
  flush();
  return rows;
}

/* ------------------------------------------------------------------ */
/* Repli des longues zones inchangées (façon GitHub)                   */
/* ------------------------------------------------------------------ */

const CONTEXTE = 2; // nb de lignes inchangées gardées de chaque côté d'un changement
type Bloc = { type: "rows"; rows: Row[] } | { type: "gap"; count: number };

function replier(rows: Row[]): Bloc[] {
  // indices « proches d'un changement » (contexte) à toujours montrer
  const garde = new Array(rows.length).fill(false);
  rows.forEach((r, i) => {
    if (r.change) {
      for (let k = Math.max(0, i - CONTEXTE); k <= Math.min(rows.length - 1, i + CONTEXTE); k++)
        garde[k] = true;
    }
  });

  const blocs: Bloc[] = [];
  let i = 0;
  while (i < rows.length) {
    if (garde[i]) {
      const buf: Row[] = [];
      while (i < rows.length && garde[i]) buf.push(rows[i++]);
      blocs.push({ type: "rows", rows: buf });
    } else {
      let count = 0;
      while (i < rows.length && !garde[i]) {
        count++;
        i++;
      }
      blocs.push({ type: "gap", count });
    }
  }
  return blocs;
}

/* ------------------------------------------------------------------ */
/* Rendu                                                               */
/* ------------------------------------------------------------------ */

function cellBg(c: Cell): string {
  if (!c) return "bg-fond/60";
  if (c.type === "supprime") return "bg-red-50";
  if (c.type === "ajoute") return "bg-green-50";
  return "";
}

function gutter(c: Cell): string {
  if (c?.type === "supprime") return "−";
  if (c?.type === "ajoute") return "+";
  return "";
}

// Rendu d'une cellule : surlignage mot-à-mot si segments dispo, sinon ligne pleine.
function contenu(c: Cell) {
  if (!c) return null;
  if (c.segs) {
    const fort = c.type === "supprime" ? "bg-red-200 text-red-900" : "bg-green-200 text-green-900";
    return (
      <>
        {c.segs.map((s, i) =>
          s.chg && s.t.trim() ? (
            <span key={i} className={`rounded-sm ${fort}`}>
              {s.t}
            </span>
          ) : (
            <span key={i}>{s.t}</span>
          )
        )}
      </>
    );
  }
  return c.texte;
}

function LigneDiff({ cell }: { cell: Cell }) {
  const txt =
    cell?.type === "supprime" ? "text-red-800" : cell?.type === "ajoute" ? "text-green-800" : "text-gris";
  return (
    <div className={`flex gap-2 px-3 py-1 ${cellBg(cell)} ${txt}`}>
      <span className="w-2 shrink-0 select-none opacity-50">{gutter(cell)}</span>
      <span className="whitespace-pre-wrap">{contenu(cell)}</span>
    </div>
  );
}

export default function TexteDiff({
  diff,
  info,
}: {
  diff: DiffLigne[];
  info?: { avant: string; apres: string };
}) {
  const [toutMontrer, setToutMontrer] = useState(false);
  const rows = toRows(diff);
  const nbChang = rows.filter((r) => r.change).length;
  const blocs = toutMontrer ? [{ type: "rows", rows } as Bloc] : replier(rows);

  return (
    <div className="mt-4 border-t border-bordure pt-4">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-gris">Évolution du texte de l&apos;article</h3>
        <button onClick={() => setToutMontrer((v) => !v)} className="text-xs text-bleu">
          {toutMontrer ? "Masquer les passages inchangés" : "Afficher tout le texte"}
        </button>
      </div>
      <p className="mb-3 text-xs text-gris">
        Comparaison du texte officiel entre deux versions —{" "}
        <span className="rounded-sm bg-red-200 px-1 text-red-900">retiré</span>{" "}
        <span className="rounded-sm bg-green-200 px-1 text-green-900">ajouté</span> · seuls les mots modifiés
        sont surlignés. Source : Assemblée nationale.
      </p>

      {/* défilement horizontal sur petits écrans (les 2 colonnes ne s'écrasent pas) */}
      <div className="overflow-x-auto rounded-lg border border-bordure">
       <div className="min-w-[640px]">
        <div className="grid grid-cols-2 border-b border-bordure bg-fond text-xs font-medium">
          <div className="border-r border-bordure px-3 py-2 text-gris">Avant — {info?.avant ?? "version initiale"}</div>
          <div className="px-3 py-2 text-gris">Après — {info?.apres ?? "version finale"}</div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto font-mono text-xs leading-relaxed">
          {blocs.map((b, bi) =>
            b.type === "gap" ? (
              <button
                key={`g-${bi}`}
                onClick={() => setToutMontrer(true)}
                className="flex w-full items-center gap-2 border-y border-bordure bg-slate-50 px-3 py-1.5 text-left text-[11px] text-gris hover:bg-slate-100"
              >
                <span className="select-none">⋯</span>
                {b.count} alinéa{b.count > 1 ? "s" : ""} identique{b.count > 1 ? "s" : ""} — afficher
              </button>
            ) : (
              b.rows.map((r, ri) => (
                <div key={`r-${bi}-${ri}`} className="grid grid-cols-2 border-b border-gray-50 last:border-0">
                  <div className="border-r border-bordure">
                    <LigneDiff cell={r.left} />
                  </div>
                  <LigneDiff cell={r.right} />
                </div>
              ))
            )
          )}
        </div>
       </div>
      </div>

      <div className="mt-2 text-xs text-gris">
        {nbChang === 0 ? "Aucune différence de texte entre ces deux versions." : `${nbChang} passage${nbChang > 1 ? "s" : ""} modifié${nbChang > 1 ? "s" : ""}.`}
      </div>
    </div>
  );
}
