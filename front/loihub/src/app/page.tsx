import SiteHeader from "@/components/SiteHeader";
import HomeSearch from "@/components/HomeSearch";
import HomeHero from "@/components/HomeHero";
import LoiCard from "@/components/LoiCard";
import { getLoisEnCours } from "@/lib/queries";

export default function Home() {
  const lois = getLoisEnCours();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-10 p-6">
        <HomeSearch />

        <HomeHero />

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Lois en cours</h2>
            <button className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50">
              Découvrir l&apos;historique
            </button>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {lois.map((loi) => (
              <LoiCard key={loi.numero} loi={loi} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
