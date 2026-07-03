import Link from "next/link";

const EXEMPLES = ["Loi immigration", "Réforme des retraites", "Loi climat"];

export default function HomeSearch() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 h-4 w-4 shrink-0 text-gray-400">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          placeholder="Rechercher une loi, un amendement, un député..."
          className="flex-1 bg-transparent px-1 py-1.5 text-sm text-slate-900 placeholder:text-gray-400 focus:outline-none"
        />
        <button className="rounded-lg bg-orange-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-700">
          Rechercher
        </button>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        Exemples populaires :{" "}
        {EXEMPLES.map((ex, i) => (
          <span key={ex}>
            <Link href="#" className="text-blue-600 hover:underline">
              {ex}
            </Link>
            {i < EXEMPLES.length - 1 && " · "}
          </span>
        ))}
      </div>
    </div>
  );
}
