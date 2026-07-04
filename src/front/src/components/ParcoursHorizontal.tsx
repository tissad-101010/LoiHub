import { ActeurEtape, EtapeParcours } from "@/lib/types";
import { COULEUR_ACTEUR } from "@/lib/ui";

const LEGENDE: { acteur: ActeurEtape; label: string }[] = [
  { acteur: "depot", label: "Dépôt / adoption" },
  { acteur: "commission", label: "Commission" },
  { acteur: "assemblee", label: "Assemblée nationale" },
  { acteur: "senat", label: "Sénat" },
];

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-900">Parcours législatif</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {LEGENDE.map((l) => (
            <span key={l.acteur} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ border: `2px solid ${COULEUR_ACTEUR[l.acteur].accent}`, backgroundColor: COULEUR_ACTEUR[l.acteur].clair }}
              />
              {l.label}
            </span>
          ))}
          <span className="text-gray-400">· cliquez une étape pour explorer le texte</span>
        </div>
      </div>
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
