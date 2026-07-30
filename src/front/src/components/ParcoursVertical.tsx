"use client";
import { ActeurEtape, EtapeParcours } from "@/lib/types";
import { COULEUR_ACTEUR } from "@/lib/ui";
import Terme from "./Terme";

// Parcours législatif en timeline VERTICALE (colonne latérale de la page loi,
// façon mockup du défi) : chaque étape est cliquable pour explorer le texte tel
// qu'il était à ce moment-là. Collé en haut d'écran sur desktop -> on change
// d'étape sans remonter la page.

const LEGENDE: { acteur: ActeurEtape; label: string }[] = [
  { acteur: "assemblee", label: "Assemblée" },
  { acteur: "senat", label: "Sénat" },
  { acteur: "commission", label: "Commission" },
];

export default function ParcoursVertical({
  etapes,
  etapeActive,
  onSelect,
}: {
  etapes: EtapeParcours[];
  etapeActive: number | null;
  onSelect: (index: number) => void;
}) {
  const dernierFait = etapes.reduce((acc, e, i) => (e.fait ? i : acc), -1);

  return (
    <div className="border border-bordure bg-white p-5">
      <h2 className="titre text-xl text-encre">Parcours législatif</h2>
      <p className="mt-1 mb-4 text-xs leading-relaxed text-gris">
        Du dépôt à l&apos;entrée en vigueur — les allers-retours Assemblée/Sénat forment la{" "}
        <Terme mot="navette">navette</Terme>.{" "}
        <span className="font-medium text-encre">
          Cliquez une étape pour lire le texte tel qu&apos;il était à ce moment-là.
        </span>
      </p>

      <ol className="relative">
        {/* rail vertical + progression jusqu'à la dernière étape franchie */}
        <span aria-hidden className="absolute bottom-3 left-[11px] top-3 w-0.5 bg-gray-200" />
        {dernierFait > 0 && (
          <span
            aria-hidden
            className="absolute left-[11px] top-3 w-0.5 bg-bleu"
            style={{ height: `${(dernierFait / Math.max(etapes.length - 1, 1)) * 100}%` }}
          />
        )}
        {etapes.map((e, i) => {
          const active = etapeActive === i;
          const { clair, accent } = COULEUR_ACTEUR[e.acteur];
          return (
            <li key={i} className="relative">
              <button
                type="button"
                onClick={() => onSelect(active ? -1 : i)}
                aria-pressed={active}
                className={`group relative z-10 flex w-full items-start gap-3 rounded-lg px-1 py-2 text-left transition ${
                  active ? "bg-bleu-100" : "hover:bg-fond"
                }`}
              >
                <span
                  className="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: e.fait ? accent : "#fff",
                    border: `2px solid ${e.fait ? accent : "#d1d5db"}`,
                    boxShadow: active ? `0 0 0 3px ${accent}44` : undefined,
                  }}
                >
                  {e.fait && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" className="h-3 w-3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm leading-snug ${
                      active ? "font-semibold" : e.fait ? "font-medium text-encre" : "text-gris"
                    }`}
                    style={active ? { color: accent } : undefined}
                  >
                    {e.label}
                  </span>
                  <span className="text-xs text-gris">{e.date || "à venir"}</span>
                </span>
                {active && (
                  <span
                    className="mt-1 shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium"
                    style={{ backgroundColor: clair, color: accent }}
                  >
                    affichée
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-bordure pt-3 text-[11px] text-gris">
        {LEGENDE.map((l) => (
          <span key={l.acteur} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: COULEUR_ACTEUR[l.acteur].accent }}
            />
            {l.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3 w-3 text-gris">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          étape franchie
        </span>
      </div>
    </div>
  );
}
