import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Fil from "@/components/Fil";
import LoiCard from "@/components/LoiCard";
import Pagination from "@/components/Pagination";
import { getDossiersPage } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Registre législatif",
  description:
    "L'ensemble des dossiers législatifs de la XVIIe législature, avec leur statut, leurs amendements et les députés impliqués.",
};

const PER_PAGE = 24;

export default async function LoisPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const { items, total, page: pageSafe, totalPages } = await getDossiersPage({ page, perPage: PER_PAGE, q });

  const debut = (pageSafe - 1) * PER_PAGE + 1;
  const fin = Math.min(pageSafe * PER_PAGE, total);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <Fil items={[{ label: "Accueil", href: "/" }, { label: "Registre législatif" }]} />

        <div>
          <span className="tricolore-accent mb-3" />
          <h1 className="titre text-3xl text-encre">Registre législatif</h1>
          <p className="mt-1 text-sm text-gris">
            {/* chaîne unique : le compilateur JSX avale l'espace après l'expression */}
            {`${total.toLocaleString("fr-FR")} dossiers de la XVIIe législature, classés par volume d'amendements.`}
          </p>
        </div>

        {/* Recherche (GET serveur) */}
        <form action="/lois" method="get" className="flex max-w-xl items-center gap-2 border border-bordure bg-white p-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1 h-4 w-4 shrink-0 text-gris">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Rechercher un dossier par titre…"
            className="flex-1 bg-transparent px-1 py-1 text-sm text-encre placeholder:text-gris focus:outline-none"
            aria-label="Rechercher un dossier"
          />
          <button type="submit" className="bg-bleu px-3 py-1.5 text-sm font-medium text-white transition hover:bg-bleu-survol">
            Rechercher
          </button>
        </form>

        {items.length === 0 ? (
          <p className="border border-dashed border-bordure bg-fond px-4 py-8 text-center text-sm text-gris">
            Aucun dossier ne correspond à « {q} ».
          </p>
        ) : (
          <>
            <div className="text-xs text-gris">
              Résultats {debut.toLocaleString("fr-FR")}–{fin.toLocaleString("fr-FR")} sur{" "}
              {total.toLocaleString("fr-FR")}
            </div>
            <div className="space-y-3">
              {items.map((loi) => (
                <LoiCard key={loi.numero} loi={loi} layout="horizontal" />
              ))}
            </div>
            <Pagination page={pageSafe} totalPages={totalPages} q={q || undefined} />
          </>
        )}
      </main>
    </div>
  );
}
