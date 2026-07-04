import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import HomeHero from "@/components/HomeHero";
import LoiCard from "@/components/LoiCard";
import { getLoisEnCours } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const lois = await getLoisEnCours();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-10 p-6">
        <HomeHero />

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Lois en cours</h2>
            <Link
              href="/historique"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Découvrir l&apos;historique
            </Link>
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
