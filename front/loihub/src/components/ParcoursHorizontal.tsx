import { EtapeParcours } from "@/lib/types";
import { COULEUR_ACTEUR } from "@/lib/ui";

export default function ParcoursHorizontal({
  etapes,
  etapeActive,
  onSelect,
}: {
  etapes: EtapeParcours[];
  etapeActive: number | null;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-6 font-semibold text-slate-900">Parcours législatif</h2>
      <div className="relative flex items-start">
        <div className="absolute left-0 right-0 top-3 h-0.5 bg-gray-200" />
        {etapes.map((e, i) => {
          const active = etapeActive === i;
          const { clair, accent } = COULEUR_ACTEUR[e.acteur];
          return (
            <button
              key={i}
              onClick={() => onSelect(active ? -1 : i)}
              className="group relative z-10 flex flex-1 flex-col items-center gap-2 text-center"
            >
              <span
                className="h-6 w-6 rounded-full transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: e.fait ? clair : "#fff",
                  border: `2px solid ${e.fait ? accent : "#d1d5db"}`,
                  boxShadow: active ? `0 0 0 3px ${accent}33` : undefined,
                }}
              />
              <span className={`text-xs ${active ? "font-semibold" : "text-slate-700"}`} style={active ? { color: accent } : undefined}>
                {e.label}
              </span>
              <span className="text-xs text-gray-400">{e.date}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
