import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { getHistoriqueGlobal } from "@/lib/queries";
import { COULEUR_ACTEUR } from "@/lib/ui";

export default function HistoriquePage() {
  const evenements = getHistoriqueGlobal();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historique législatif</h1>
          <p className="text-sm text-gray-500">
            Tous les évènements récents, tous dossiers de loi confondus.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <ol className="relative border-l-2 border-gray-100 pl-6">
            {evenements.map((e, i) => {
              const couleur = COULEUR_ACTEUR[e.acteur];
              return (
                <li key={`${e.loiNumero}-${i}`} className="mb-6 last:mb-0">
                  <span
                    className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: couleur.accent }}
                  />
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium" style={{ color: couleur.accent }}>
                      {e.label}
                    </span>
                    <span className="shrink-0 text-xs text-gray-400">{e.date}</span>
                  </div>
                  <Link href={`/loi/${e.loiNumero}`} className="text-sm text-slate-700 hover:underline">
                    {e.loiTitre}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </main>
    </div>
  );
}
