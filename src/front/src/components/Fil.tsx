import Link from "next/link";

// Fil d'Ariane (breadcrumb) — élément DSFR des pages internes.
export default function Fil({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1.5 text-xs text-gris">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-bordure">›</span>}
          {it.href ? (
            <Link href={it.href} className="hover:text-bleu hover:underline">
              {it.label}
            </Link>
          ) : (
            <span className="max-w-[22rem] truncate text-encre">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
