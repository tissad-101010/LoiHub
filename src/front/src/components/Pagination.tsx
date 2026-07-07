import Link from "next/link";

// Pagination façon DSFR : Précédent · fenêtre de pages · Suivant.
function fenetre(page: number, total: number): (number | "…")[] {
  const pages = new Set<number>([1, total, page - 1, page, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of list) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export default function Pagination({
  page,
  totalPages,
  q,
}: {
  page: number;
  totalPages: number;
  q?: string;
}) {
  if (totalPages <= 1) return null;
  const href = (p: number) => `/lois?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  const lien = (p: number, label: React.ReactNode, actif = false, disabled = false) =>
    disabled ? (
      <span className="px-3 py-2 text-sm text-bordure">{label}</span>
    ) : (
      <Link
        href={href(p)}
        aria-current={actif ? "page" : undefined}
        className={`px-3 py-2 text-sm font-medium transition ${
          actif ? "bg-bleu text-white" : "text-encre hover:bg-fond-alt"
        }`}
      >
        {label}
      </Link>
    );

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1 border-t border-bordure pt-6">
      {lien(page - 1, "← Précédent", false, page <= 1)}
      {fenetre(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 text-gris">
            …
          </span>
        ) : (
          <span key={p} className="ref-mono">
            {lien(p, p, p === page)}
          </span>
        )
      )}
      {lien(page + 1, "Suivant →", false, page >= totalPages)}
    </nav>
  );
}
