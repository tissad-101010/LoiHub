import { ProjetLoi } from "@/lib/types";

const icones = {
  amendements: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M9 12h6M9 16h6M9 8h2" strokeLinecap="round" />
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" strokeLinejoin="round" />
    </svg>
  ),
  deputes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <path d="M16 8a3 3 0 1 1 0 0" />
      <path d="M15 14c2.8 0 6 1.5 6 6" strokeLinecap="round" />
    </svg>
  ),
  votes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  debats: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M4 5h16v10H8l-4 4V5z" strokeLinejoin="round" />
    </svg>
  ),
};

export default function StatsCards({ stats }: { stats: ProjetLoi["stats"] }) {
  const cards = [
    { label: "Amendements", value: stats.amendements, sub: `dont ${stats.amendementsAdoptes} adoptés`, icone: icones.amendements, bg: "bg-bleu-100", fg: "text-bleu", dispo: true },
    { label: "Députés impliqués", value: stats.deputesImpliques, sub: `sur ${stats.deputesTotal}`, icone: icones.deputes, bg: "bg-bleu-100", fg: "text-bleu", dispo: true },
    { label: "Votes enregistrés", value: stats.votes, sub: "scrutins publics", icone: icones.votes, bg: "bg-purple-100", fg: "text-purple-600", dispo: stats.votes > 0 },
    { label: "Débats", value: stats.heuresDebat, sub: "heures de débats", icone: icones.debats, bg: "bg-pink-100", fg: "text-pink-600", dispo: stats.heuresDebat > 0 },
  ];
  return (
    <div className="grid grid-cols-2 divide-x divide-y divide-bordure border border-bordure bg-white sm:divide-y-0 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="p-5">
          <div className="mb-2 flex items-center gap-2 text-gris">
            <span className="text-gris">{c.icone}</span>
            <span className="text-xs uppercase tracking-wide">{c.label}</span>
          </div>
          {c.dispo ? (
            <>
              <div className="ref-mono text-3xl font-bold text-bleu">{c.value.toLocaleString("fr-FR")}</div>
              <div className="mt-0.5 text-xs text-gris">{c.sub}</div>
            </>
          ) : (
            <>
              <div className="text-lg font-medium text-gray-300">non disponible</div>
              <div className="mt-0.5 text-xs text-gray-300">bientôt</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
