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
    { label: "Amendements", value: stats.amendements, sub: `dont ${stats.amendementsAdoptes} adoptés`, icone: icones.amendements, bg: "bg-blue-100", fg: "text-blue-600", dispo: true },
    { label: "Députés impliqués", value: stats.deputesImpliques, sub: `sur ${stats.deputesTotal}`, icone: icones.deputes, bg: "bg-[#e6e6f1]", fg: "text-[#000175]", dispo: true },
    { label: "Votes enregistrés", value: stats.votes, sub: "scrutins publics", icone: icones.votes, bg: "bg-purple-100", fg: "text-purple-600", dispo: stats.votes > 0 },
    { label: "Débats", value: stats.heuresDebat, sub: "heures de débats", icone: icones.debats, bg: "bg-pink-100", fg: "text-pink-600", dispo: stats.heuresDebat > 0 },
  ];
  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.bg} ${c.fg}`}>{c.icone}</span>
            <span className="text-xs text-gray-500">{c.label}</span>
          </div>
          {c.dispo ? (
            <>
              <div className="text-2xl font-bold text-slate-900">{c.value.toLocaleString("fr-FR")}</div>
              <div className="text-xs text-gray-400">{c.sub}</div>
            </>
          ) : (
            <>
              <div className="text-lg font-medium text-gray-300">non disponible</div>
              <div className="text-xs text-gray-300">bientôt</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
