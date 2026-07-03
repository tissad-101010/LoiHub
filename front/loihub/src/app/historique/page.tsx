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
          <p className="text-sm text-gray-500">Tous les dossiers de loi suivis par LoiHub et leur statut actuel.</p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {lois.map((loi) => (
            <LoiCard key={loi.numero} loi={loi} />
          ))}
        </div>
      </main>
    </div>
  );
}
