import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import DeputesAnnuaire from "@/components/DeputesAnnuaire";
import { getDeputes } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Députés",
  description:
    "Annuaire des 577 députés de la XVIIe législature, classés par nombre d'amendements déposés. Filtrez par groupe politique.",
};

export default async function DeputesPage() {
  const deputes = await getDeputes();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <div>
          <span className="tricolore-accent mb-3" />
          <h1 className="titre text-3xl text-encre">Députés</h1>
          <p className="text-sm text-gris">
            Les {deputes.length} députés de la XVIIe législature, classés par nombre d&apos;amendements déposés.
          </p>
        </div>
        <DeputesAnnuaire deputes={deputes} />
      </main>
    </div>
  );
}
