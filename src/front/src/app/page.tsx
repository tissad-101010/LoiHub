import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import HomeHero from "@/components/HomeHero";
import LoiCard from "@/components/LoiCard";
import { getDossiersPage } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { items, total } = await getDossiersPage({ page: 1, perPage: 6 });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-12 p-6 pb-16">
        <HomeHero featured={items[0]} />

        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <span className="tricolore-accent mb-3" />
              <h2 className="titre text-2xl text-encre">Les plus discutés</h2>
              <p className="mt-1 text-sm text-gris">Les textes qui concentrent le plus d&apos;amendements.</p>
            </div>
            <Link
              href="/lois"
              className="shrink-0 bg-bleu px-4 py-2 text-sm font-medium text-white transition hover:bg-bleu-survol"
            >
              Voir les {total.toLocaleString("fr-FR")} dossiers →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((loi) => (
              <LoiCard key={loi.numero} loi={loi} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
