import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Fil from "@/components/Fil";
import Pagination from "@/components/Pagination";
import BarreVote from "@/components/BarreVote";
import { getScrutinsPage } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scrutins publics",
  description:
    "Les scrutins publics de l'Assemblée nationale sous la XVIIe législature : objet, résultat et position nominative de chaque député.",
};

const PER_PAGE = 25;

export default async function VotesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; issue?: string; dossier?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const issue = sp.issue === "adoptes" || sp.issue === "rejetes" ? sp.issue : undefined;
  const dossier = (sp.dossier ?? "").trim() || undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const { items, total, page: pageSafe, totalPages } = await getScrutinsPage({
    page,
    perPage: PER_PAGE,
    q,
    issue,
    dossier,
  });

  const debut = (pageSafe - 1) * PER_PAGE + 1;
  const fin = Math.min(pageSafe * PER_PAGE, total);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <Fil items={[{ label: "Accueil", href: "/" }, { label: "Scrutins publics" }]} />

        <div>
          <span className="tricolore-accent mb-3" />
          <h1 className="titre text-3xl text-encre">Scrutins publics</h1>
          <p className="mt-1 max-w-3xl text-sm text-gris">
            {`${total.toLocaleString("fr-FR")} scrutins. `}
            Un scrutin public enregistre la position de chaque député, nom par nom. Ouvrez-en un pour
            voir la ventilation par groupe.
          </p>
        </div>

        <form
          action="/votes"
          method="get"
          className="grid grid-cols-1 gap-3 border border-bordure bg-white p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]"
        >
          <label className="text-xs text-gris">
            Recherche
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Objet du vote, texte concerné…"
              className="mt-1 block w-full border border-bordure px-2 py-1.5 text-sm text-encre placeholder:text-gris"
            />
          </label>
          <label className="text-xs text-gris">
            Issue
            <select
              name="issue"
              defaultValue={issue ?? ""}
              className="mt-1 block w-full border border-bordure bg-white px-2 py-1.5 text-sm text-encre"
            >
              <option value="">Toutes</option>
              <option value="adoptes">Adoptés</option>
              <option value="rejetes">Non adoptés</option>
            </select>
          </label>
          {dossier && <input type="hidden" name="dossier" value={dossier} />}
          <button
            type="submit"
            className="self-end bg-bleu px-4 py-2 text-sm font-medium text-white transition hover:bg-bleu-survol"
          >
            Filtrer
          </button>
        </form>

        {items.length === 0 ? (
          <p className="border border-dashed border-bordure bg-fond px-4 py-8 text-center text-sm text-gris">
            Aucun scrutin ne correspond à ces critères.
          </p>
        ) : (
          <>
            <div className="text-xs text-gris">
              Résultats {debut.toLocaleString("fr-FR")}–{fin.toLocaleString("fr-FR")} sur{" "}
              {total.toLocaleString("fr-FR")}, du plus récent au plus ancien.
            </div>

            <ul className="space-y-2">
              {items.map((s) => (
                <li key={s.uid}>
                  <Link
                    href={`/vote/${encodeURIComponent(s.uid)}`}
                    className="group block border border-bordure bg-white p-4 transition hover:border-bleu hover:shadow-[0_6px_20px_rgba(0,0,18,0.07)]"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-encre group-hover:text-bleu">{s.titre}</div>
                        <div className="mt-0.5 text-xs text-gris">
                          {s.date}
                          {s.numero && ` · scrutin n° ${s.numero}`}
                          {s.dossierTitre && ` · ${s.dossierTitre}`}
                        </div>
                      </div>
                      <span
                        title={s.sortLibelle}
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.adopte ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {s.adopte ? "Adopté" : "Rejeté"}
                      </span>
                    </div>
                    <BarreVote scrutin={s} legende />
                  </Link>
                </li>
              ))}
            </ul>

            <Pagination
              page={pageSafe}
              totalPages={totalPages}
              base="/votes"
              params={{ q: q || undefined, issue, dossier }}
            />
          </>
        )}
      </main>
    </div>
  );
}
