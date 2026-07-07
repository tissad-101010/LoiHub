import type { DeputeProfil } from "@/lib/types";

// Frise du nombre d'amendements déposés par mois (barres). Données réelles.
export default function ActiviteDepute({
  activite,
  couleur,
}: {
  activite: DeputeProfil["activite"];
  couleur: string;
}) {
  if (activite.length < 2) return null;
  const max = Math.max(...activite.map((a) => a.total), 1);
  const totalMax = activite.reduce((s, a) => s + a.total, 0);

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="titre text-xl text-encre">Activité</h2>
        <span className="rounded-full bg-fond-alt px-2 py-0.5 text-xs font-medium text-gris">
          {totalMax.toLocaleString("fr-FR")} amendements
        </span>
      </div>
      <div className="border border-bordure bg-white p-4">
        <div className="flex h-40 items-end gap-1 overflow-x-auto">
          {activite.map((a) => (
            <div
              key={a.mois}
              className="flex h-full min-w-[8px] flex-1 items-end"
              title={`${a.libelle} : ${a.total} amendement${a.total > 1 ? "s" : ""}`}
            >
              <div
                className="w-full rounded-t transition-opacity hover:opacity-80"
                style={{ height: `${Math.max(2, (a.total / max) * 100)}%`, backgroundColor: couleur }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-gris">
          <span>{activite[0].libelle}</span>
          <span>{activite[activite.length - 1].libelle}</span>
        </div>
      </div>
    </section>
  );
}
