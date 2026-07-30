import { ActeurEtape, EtapeParcours } from "@/lib/types";
import { COULEUR_ACTEUR } from "@/lib/ui";
import Terme from "./Terme";

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
    <div className="border border-bordure bg-white p-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="titre text-xl text-encre">Parcours législatif</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gris">
          {LEGENDE.map((l) => (
            <span key={l.acteur} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ border: `2px solid ${COULEUR_ACTEUR[l.acteur].accent}`, backgroundColor: COULEUR_ACTEUR[l.acteur].clair }}
              />
              {l.label}
            </span>
          ))}
          <span className="text-gris">· cliquez une étape pour explorer le texte</span>
        </div>
      </div>
      <p className="mb-6 text-xs text-gris">
        Le chemin du texte, de son dépôt à son entrée en vigueur. Les allers-retours entre
        l&apos;Assemblée nationale et le Sénat forment la{" "}
        <Terme mot="navette">navette parlementaire</Terme>.
      </p>
      {/* défilement horizontal sur mobile : les étapes gardent une largeur lisible */}
      <div className="-mx-2 overflow-x-auto px-2 pb-1">
      <div className="relative flex min-w-[520px] items-start">
        {/* rail gris + progression bleue jusqu'à la dernière étape franchie */}
        <div className="absolute left-0 right-0 top-3 h-0.5 bg-gray-200" />
        {(() => {
          const dernierFait = etapes.reduce((acc, e, i) => (e.fait ? i : acc), -1);
          if (dernierFait <= 0 || etapes.length < 2) return null;
          // la ligne relie les CENTRES des étapes : demi-pas de marge de chaque côté
          const pas = 100 / etapes.length;
          return (
            <div
              className="absolute top-3 h-0.5 bg-bleu transition-all"
              style={{ left: `${pas / 2}%`, width: `${pas * dernierFait}%` }}
            />
          );
        })()}
        {etapes.map((e, i) => {
          const active = etapeActive === i;
          const { clair, accent } = COULEUR_ACTEUR[e.acteur];
          return (
            <button
              key={i}
              onClick={() => onSelect(active ? -1 : i)}
              className="group relative z-10 flex min-w-[64px] flex-1 flex-col items-center gap-2 px-1 text-center"
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: e.fait ? accent : "#fff",
                  border: `2px solid ${e.fait ? accent : "#d1d5db"}`,
                  boxShadow: active ? `0 0 0 3px ${accent}44` : undefined,
                }}
              >
                {/* coche blanche : étape franchie — l'état ne repose pas que sur la couleur */}
                {e.fait && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" className="h-3.5 w-3.5">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                className={`text-xs leading-snug ${active ? "font-semibold" : e.fait ? "font-medium text-encre" : "text-gris"}`}
                style={active ? { color: accent } : undefined}
              >
                {e.label}
              </span>
              <span className="text-xs text-gris">{e.date}</span>
              <span
                className="mt-0.5 hidden rounded-full px-1.5 py-px text-[10px] font-medium sm:inline-block"
                style={{ backgroundColor: clair, color: accent, opacity: active ? 1 : 0 }}
              >
                étape sélectionnée
              </span>
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}
