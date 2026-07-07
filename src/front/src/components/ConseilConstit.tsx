import type { ProjetLoi } from "@/lib/types";

// Saisines du Conseil constitutionnel (données AN). On n'affiche que ce que la
// source contient (dates + auteur de la saisine) ; le sens de la décision n'est
// pas fourni par le dump, on ne l'invente donc pas.
export default function ConseilConstit({ cc }: { cc: NonNullable<ProjetLoi["conseilConstit"]> }) {
  return (
    <div className="border border-bordure bg-white p-5">
      <div className="mb-1 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-gris">
          <path d="M12 3l8 4v5c0 4.5-3 7.5-8 9-5-1.5-8-4.5-8-9V7l8-4z" strokeLinejoin="round" />
        </svg>
        <h2 className="titre text-xl text-encre">Conseil constitutionnel</h2>
      </div>
      <p className="mb-3 text-xs text-gris">
        Le texte a été déféré au Conseil constitutionnel avant promulgation.
      </p>
      <ul className="space-y-2">
        {cc.saisines.map((s, i) => (
          <li key={i} className="flex items-center gap-3 rounded-lg border border-bordure bg-fond px-3 py-2 text-sm">
            <span className="text-encre">Saisine — {s.par}</span>
            <span className="ml-auto text-xs text-gris">{s.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
