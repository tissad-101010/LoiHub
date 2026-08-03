import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Fil from "@/components/Fil";
import Pagination from "@/components/Pagination";
import ParlementaireAvatar from "@/components/ParlementaireAvatar";
import { FILTRES_SORT, getAmendementsPage, getGroupes, type FiltreSort } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Registre des amendements",
  description:
    "Les amendements déposés à l'Assemblée nationale sous la XVIIe législature : auteur, groupe, texte visé et sort publié.",
};

const PER_PAGE = 25;

export default async function AmendementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sort?: string; groupe?: string; dossier?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const sort = (sp.sort && sp.sort in FILTRES_SORT ? (sp.sort as FiltreSort) : undefined) ?? undefined;
  const groupe = (sp.groupe ?? "").trim() || undefined;
  const dossier = (sp.dossier ?? "").trim() || undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [{ items, total, page: pageSafe, totalPages }, groupes] = await Promise.all([
    getAmendementsPage({ page, perPage: PER_PAGE, q, sort, groupe, dossier }),
    getGroupes(),
  ]);

  const debut = (pageSafe - 1) * PER_PAGE + 1;
  const fin = Math.min(pageSafe * PER_PAGE, total);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <Fil items={[{ label: "Accueil", href: "/" }, { label: "Amendements" }]} />

        <div>
          <span className="tricolore-accent mb-3" />
          <h1 className="titre text-3xl text-encre">Registre des amendements</h1>
          <p className="mt-1 max-w-3xl text-sm text-gris">
            {`${total.toLocaleString("fr-FR")} amendements correspondent à votre recherche. `}
            Le sort affiché est celui <span className="font-medium text-encre">publié par l&apos;Assemblée
            nationale</span> : quand il est absent, c&apos;est écrit — rien n&apos;est déduit.
          </p>
        </div>

        <form
          action="/amendements"
          method="get"
          className="grid grid-cols-1 gap-3 border border-bordure bg-white p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          <label className="text-xs text-gris">
            Recherche
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Numéro, auteur, texte…"
              className="mt-1 block w-full border border-bordure px-2 py-1.5 text-sm text-encre placeholder:text-gris"
            />
          </label>
          <label className="text-xs text-gris">
            Sort
            <select
              name="sort"
              defaultValue={sort ?? ""}
              className="mt-1 block w-full border border-bordure bg-white px-2 py-1.5 text-sm text-encre"
            >
              <option value="">Tous</option>
              {Object.entries(FILTRES_SORT).map(([cle, f]) => (
                <option key={cle} value={cle}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-gris">
            Groupe de l&apos;auteur
            <select
              name="groupe"
              defaultValue={groupe ?? ""}
              className="mt-1 block w-full border border-bordure bg-white px-2 py-1.5 text-sm text-encre"
            >
              <option value="">Tous</option>
              {groupes.map((g) => (
                <option key={g.groupe} value={g.groupe}>
                  {g.groupe} — {g.libelle}
                </option>
              ))}
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

        {dossier && (
          <p className="text-xs text-gris">
            Filtré sur un dossier précis.{" "}
            <Link href="/amendements" className="lien">
              Retirer ce filtre
            </Link>
          </p>
        )}

        {items.length === 0 ? (
          <p className="border border-dashed border-bordure bg-fond px-4 py-8 text-center text-sm text-gris">
            Aucun amendement ne correspond à ces critères.
          </p>
        ) : (
          <>
            <div className="text-xs text-gris">
              Résultats {debut.toLocaleString("fr-FR")}–{fin.toLocaleString("fr-FR")} sur{" "}
              {total.toLocaleString("fr-FR")}, du plus récent au plus ancien.
            </div>

            <ul className="space-y-2">
              {items.map((a) => (
                <li key={a.uid}>
                  <Link
                    href={`/amendement/${encodeURIComponent(a.uid)}`}
                    className="group grid grid-cols-1 gap-3 border border-bordure bg-white p-4 transition hover:border-bleu hover:shadow-[0_6px_20px_rgba(0,0,18,0.07)] sm:grid-cols-[minmax(0,1fr)_11rem]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="ref-mono text-sm font-semibold text-encre group-hover:text-bleu">
                          Amendement n° {a.numero}
                        </span>
                        {a.article && <span className="ref-mono text-[11px] text-gris">{a.article}</span>}
                        <span
                          className={`px-1.5 py-0.5 text-xs font-medium ${
                            a.adopte
                              ? "bg-green-100 text-green-700"
                              : a.rejete
                                ? "bg-red-100 text-red-700"
                                : "bg-fond-alt text-gris"
                          }`}
                        >
                          {a.sortLibelle ?? "Sort non publié"}
                        </span>
                      </div>
                      {a.dossierTitre && (
                        <div className="mt-1 truncate text-sm text-encre">{a.dossierTitre}</div>
                      )}
                      <div className="mt-1 text-xs text-gris">Déposé le {a.dateDepot || "—"}</div>
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end">
                      <ParlementaireAvatar depute={a.auteur} size="sm" />
                      <div className="min-w-0 text-right">
                        <div className="truncate text-xs text-encre">{a.auteur.nom}</div>
                        {a.auteur.groupe && (
                          <div className="truncate text-[11px] text-gris">{a.auteur.groupe}</div>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <Pagination
              page={pageSafe}
              totalPages={totalPages}
              base="/amendements"
              params={{ q: q || undefined, sort, groupe, dossier }}
            />
          </>
        )}
      </main>
    </div>
  );
}
