import SiteHeader from "@/components/SiteHeader";
import LoiCard from "@/components/LoiCard";
import { getLoisEnCours } from "@/lib/queries";

export default function HistoriquePage() {
  const lois = getLoisEnCours();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historique législatif</h1>
          <p className="text-sm text-gray-500">
            Le suivi du parcours de chaque loi, du dépôt à la promulgation, avec son statut actuel.
          </p>
        </div>

        <div className="space-y-4">
          {lois.map((loi) => (
            <LoiCard key={loi.numero} loi={loi} layout="horizontal" />
          ))}
        </div>
      </main>
    </div>
  );
}
