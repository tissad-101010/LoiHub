import type { DiffLigne } from "./types";

// diff ligne-à-ligne (LCS) entre deux listes d'alinéas -> DiffLigne[]
// Module pur, partagé entre la couche données (serveur) et LoiPageClient
// (recalcul du diff à l'étape sélectionnée, côté client).
export function diffLines(a: string[], b: string[]): DiffLigne[] {
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
