"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = ["Explorer les lois", "Amendements", "Députés", "Votes", "Débats", "Statistiques"];

export default function SiteHeader() {
  const pathname = usePathname();
  const surPageLoi = pathname?.startsWith("/loi/");

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M12 3l8 4v2H4V7l8-4z" strokeLinejoin="round" />
            <path d="M5 10v8M9 10v8M15 10v8M19 10v8" strokeLinecap="round" />
            <path d="M4 20h16" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <div className="text-lg font-bold leading-tight text-slate-900">LoiHub</div>
          <div className="text-[11px] leading-tight text-gray-500">Le GitHub de la loi</div>
        </div>
      </Link>

      <nav className="hidden items-center gap-6 text-sm lg:flex">
        {NAV.map((item) => {
          const actif = surPageLoi && item === "Explorer les lois";
          return (
            <Link
              key={item}
              href={item === "Explorer les lois" ? "/" : "#"}
              className={actif ? "font-medium text-blue-600" : "text-slate-600 hover:text-slate-900"}
            >
              {item}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <button
          title="Thème sombre bientôt disponible"
          className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" strokeLinejoin="round" />
          </svg>
        </button>
        <Link
          href="#"
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-50"
        >
          À propos
        </Link>
        {surPageLoi ? (
          <Link
            href="/"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            ← Retour à l&apos;accueil
          </Link>
        ) : (
          <Link
            href="/loi/1234"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Commencer à explorer
          </Link>
        )}
      </div>
    </header>
  );
}
