import { GroupeStat } from "@/lib/types";

// Barres horizontales des amendements déposés par groupe politique, colorées à
// la couleur du groupe. La part adoptée est marquée par une barre plus foncée.
export default function RepartitionGroupes({ groupes }: { groupes: GroupeStat[] }) {
  if (!groupes.length) return null;
  const max = Math.max(...groupes.map((g) => g.total), 1);
  const totalGlobal = groupes.reduce((s, g) => s + g.total, 0);

  return (
    <div className="border border-bordure bg-white p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="titre text-xl text-encre">Amendements par groupe politique</h2>
        <span className="text-xs text-gris">{totalGlobal.toLocaleString("fr-FR")} attribués</span>
      </div>
      <p className="mb-4 text-xs text-gris">
        Nombre d&apos;amendements déposés par groupe (auteurs identifiés) ; la portion foncée correspond aux
        amendements adoptés.
      </p>

      <ul className="space-y-2.5">
        {groupes.map((g) => {
          const largeur = (g.total / max) * 100;
          const partAdoptes = g.total > 0 ? (g.adoptes / g.total) * 100 : 0;
          return (
            <li key={g.groupe} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-right text-xs font-medium text-gris" title={g.libelle}>
                {g.groupe}
              </span>
              <div className="flex-1">
                <div className="h-4 w-full overflow-hidden rounded-md bg-fond-alt">
                  <div className="h-full rounded-md" style={{ width: `${largeur}%`, backgroundColor: g.couleur }}>
                    <div
                      className="h-full rounded-l-md bg-black/25"
                      style={{ width: `${partAdoptes}%` }}
                      title={`${g.adoptes} adoptés`}
                    />
                  </div>
                </div>
              </div>
              <span className="w-24 shrink-0 text-right text-xs text-gris">
                <span className="font-medium text-encre">{g.total.toLocaleString("fr-FR")}</span>
                {g.adoptes > 0 && <span className="text-gris"> · {g.adoptes} adoptés</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
