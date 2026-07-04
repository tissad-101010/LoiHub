import { DiffLigne } from "@/lib/types";

type Cell = { texte: string; type: "supprime" | "ajoute" | "inchange" } | null;

// Transforme le diff linéaire en lignes côte-à-côte (gauche/droite) façon GitHub.
function toSplitRows(diff: DiffLigne[]): { left: Cell; right: Cell }[] {
  const rows: { left: Cell; right: Cell }[] = [];
  let dels: DiffLigne[] = [];
  let adds: DiffLigne[] = [];
  const flush = () => {
    const n = Math.max(dels.length, adds.length);
    for (let i = 0; i < n; i++) {
      rows.push({
        left: dels[i] ? { texte: dels[i].texte, type: "supprime" } : null,
        right: adds[i] ? { texte: adds[i].texte, type: "ajoute" } : null,
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
      });
    } else if (l.type === "supprime") dels.push(l);
    else adds.push(l);
  }
  flush();
  return rows;
}

function cellClass(c: Cell): string {
  if (!c) return "bg-gray-50";
  if (c.type === "supprime") return "bg-red-50 text-red-800";
  if (c.type === "ajoute") return "bg-green-50 text-green-800";
  return "text-slate-500";
}

export default function TexteDiff({
  diff,
  info,
}: {
  diff: DiffLigne[];
  info?: { avant: string; apres: string };
}) {
  const rows = toSplitRows(diff);
  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <h3 className="mb-1 text-sm font-medium text-slate-600">
        Évolution du texte de l&apos;article
      </h3>
      <p className="mb-3 text-xs text-gray-400">
        Texte intégral, deux versions côte à côte · source : texte publié de l&apos;Assemblée
        nationale
      </p>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        {/* en-têtes colonnes */}
        <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50 text-xs font-medium">
          <div className="border-r border-gray-200 px-3 py-2 text-slate-600">
            Avant — {info?.avant ?? "version initiale"}
          </div>
          <div className="px-3 py-2 text-slate-600">
            Après — {info?.apres ?? "version finale"}
          </div>
        </div>
        {/* corps : texte complet aligné */}
        <div className="max-h-[60vh] overflow-y-auto font-mono text-xs leading-relaxed">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-2">
              <div className={`border-r border-gray-100 px-3 py-1 whitespace-pre-wrap ${cellClass(r.left)}`}>
                {r.left?.texte ?? ""}
              </div>
              <div className={`px-3 py-1 whitespace-pre-wrap ${cellClass(r.right)}`}>
                {r.right?.texte ?? ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex gap-4 text-xs text-gray-400">
        <span><span className="inline-block h-2 w-2 rounded-sm bg-red-200" /> supprimé</span>
        <span><span className="inline-block h-2 w-2 rounded-sm bg-green-200" /> ajouté</span>
        <span><span className="inline-block h-2 w-2 rounded-sm bg-gray-200" /> inchangé</span>
      </div>
    </div>
  );
}
