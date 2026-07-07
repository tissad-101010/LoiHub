"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeSearch from "@/components/HomeSearch";

// Bloc « Marianne » officiel : drapeau tricolore + RÉPUBLIQUE FRANÇAISE + devise.
function BlocEtat() {
  return (
    <div className="flex items-center gap-3">
      <span className="drapeau rounded-[1px] overflow-hidden ring-1 ring-black/5" aria-hidden>
        <span className="bg-bleu" />
        <span className="bg-white" />
        <span className="bg-rouge" />
      </span>
      <div className="leading-[1.05]">
        <div className="text-[13px] font-bold uppercase tracking-wide text-encre">
          République
          <br />
          Française
        </div>
        <div className="mt-0.5 hidden text-[10px] italic text-gris sm:block">Liberté · Égalité · Fraternité</div>
      </div>
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();

  const lien = (href: string, label: string) => {
    const actif = href === "/" ? pathname === "/" : pathname?.startsWith(href);
    return (
      <Link
        href={href}
        className={`px-2 py-4 text-sm font-medium transition sm:px-3 ${
          actif
            ? "text-bleu shadow-[inset_0_-2px_0_0_var(--color-bleu)]"
            : "text-encre hover:text-bleu"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-bordure bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        {/* Bloc État + service */}
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-4">
          <BlocEtat />
          <span className="hidden h-10 w-px bg-bordure sm:block" />
          <span className="hidden sm:block">
            <span className="titre block text-xl leading-none text-encre">LoiHub</span>
            <span className="ref-mono text-[10px] uppercase tracking-wider text-gris">le dépôt de la loi</span>
          </span>
        </Link>

        <div className="ml-auto hidden max-w-sm flex-1 lg:block">
          <HomeSearch compact />
        </div>

        <nav className="ml-auto flex items-center lg:ml-0">
          {lien("/lois", "Lois")}
          {lien("/deputes", "Députés")}
          {lien("/a-propos", "À propos")}
        </nav>
      </div>
    </header>
  );
}
