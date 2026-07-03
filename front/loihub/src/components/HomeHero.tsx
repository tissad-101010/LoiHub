const MINI_PARCOURS: { label: string; date: string; couleur: string; fait: boolean }[] = [
  { label: "Dépôt du projet de loi", date: "12 janv. 2024", couleur: "#16a34a", fait: true },
  { label: "Examen en commission", date: "28 févr. 2024", couleur: "#7c3aed", fait: true },
  { label: "Première lecture à l'Assemblée", date: "18 mars 2024", couleur: "#2563eb", fait: true },
  { label: "Lecture au Sénat", date: "10 avr. 2024", couleur: "#dc2626", fait: true },
  { label: "Adoption définitive", date: "20 mai 2024", couleur: "#16a34a", fait: true },
];

const BADGE = ["Transparence", "Traçabilité", "Démocratie"];

const STATS = [
  { valeur: "577", label: "députés suivis" },
  { valeur: "24/7", label: "mise à jour continue" },
  { valeur: "100%", label: "sources officielles" },
];

export default function HomeHero() {
  return (
    <div className="grid grid-cols-2 gap-10">
      <div>
        <div className="mb-5 flex items-center gap-4">
          {BADGE.map((label) => (
            <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              {label}
            </span>
          ))}
        </div>

        <h1 className="mb-5 text-5xl font-bold leading-[1.1] tracking-tight text-slate-900">
          Comprendre la loi,
          <br />
          <span className="relative inline-block text-orange-600">
            ligne par ligne.
            <svg
              viewBox="0 0 220 12"
              className="absolute -bottom-2 left-0 h-3 w-full text-orange-200"
              preserveAspectRatio="none"
            >
              <path d="M2 8c40-6 140-6 216 0" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <p className="mb-6 max-w-md text-base leading-relaxed text-slate-600">
          LoiHub vous permet d&apos;explorer l&apos;évolution des lois comme un code source : chaque modification,
          chaque amendement, chaque vote, en toute transparence.
        </p>

        <div className="mb-6 flex divide-x divide-gray-200">
          {STATS.map((s) => (
            <div key={s.label} className="flex-1 pl-0 pr-4 first:pl-0 [&:not(:first-child)]:pl-4">
              <div className="text-xl font-bold text-slate-900">{s.valeur}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-slate-900 p-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <rect x="4" y="7" width="16" height="12" rx="2" />
                <path d="M9 3v4M15 3v4M9 13h.01M15 13h.01" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <div className="text-sm font-semibold text-white">Une question sur une loi ?</div>
              <div className="text-xs text-white/50">Interrogez notre IA et obtenez des réponses claires et sourcées.</div>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex : Pourquoi l'amendement n°452 a-t-il été adopté ?"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40"
            />
            <button className="shrink-0 rounded-lg bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-200">
              Poser la question →
            </button>
          </div>
        </div>
      </div>

      <div className="relative rounded-2xl bg-slate-900 p-6">
        <div className="mb-6 flex items-center gap-2 text-white/60 text-xs">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M12 3l8 4v2H4V7l8-4z" strokeLinejoin="round" />
            <path d="M5 10v8M9 10v8M15 10v8M19 10v8" strokeLinecap="round" />
            <path d="M4 20h16" strokeLinecap="round" />
          </svg>
          Assemblée nationale
        </div>

        <div className="mb-2 text-xs text-white/40">
          Exemple : Article 12 — Projet de loi pour le logement abordable
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-white">Amendement n°452</span>
            <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">Adopté</span>
          </div>
          <div className="mb-3 space-y-1 text-xs leading-relaxed">
            <div className="rounded bg-red-500/10 px-2 py-1 text-red-300 line-through">
              Le montant de l&apos;aide est fixé à 500 €
            </div>
            <div className="rounded bg-green-500/10 px-2 py-1 text-green-300">
              Le montant de l&apos;aide est fixé à 700 €
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs text-white/50">
            <div>Auteur : Jean Dupont</div>
            <div>Groupe : Ensemble</div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {MINI_PARCOURS.map((e) => (
            <div key={e.label} className="flex items-center gap-3 text-xs">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: e.couleur }} />
              <span className="flex-1 text-white/70">{e.label}</span>
              <span className="text-white/40">{e.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
