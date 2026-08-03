import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import Fil from "@/components/Fil";
import BarreVote from "@/components/BarreVote";
import { getScrutin } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uid: string }>;
}): Promise<Metadata> {
  const { uid } = await params;
  const s = await getScrutin(decodeURIComponent(uid));
  // notFound() dès les métadonnées : garantit un vrai 404 et non un 200 vide.
  if (!s) notFound();
  return {
    title: `Scrutin n° ${s.numero ?? ""} — ${s.adopte ? "adopté" : "rejeté"}`.trim(),
    description: `${s.titre} — ${s.pour} pour, ${s.contre} contre, ${s.abstention} abstention.`,
  };
}

export default async function VotePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const s = await getScrutin(decodeURIComponent(uid));
  if (!s) notFound();

  // L'AN publie un résultat officiel ; le total de la table nominative peut en
  // différer (non-votants, délégations, corrections de vote). On affiche les deux
  // et on explique l'écart plutôt que de choisir un chiffre en silence.
  const exprimes = s.pour + s.contre + s.abstention;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-5 p-6">
        <Fil
          items={[
            { label: "Accueil", href: "/" },
            { label: "Scrutins publics", href: "/votes" },
            { label: `Scrutin n° ${s.numero ?? "—"}` },
          ]}
        />

        <header className="border border-bordure bg-white p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="ref-mono text-xs text-gris">
              Scrutin public{s.numero && ` n° ${s.numero}`}
              {s.date && ` · ${s.date}`}
            </span>
            <span
              title={s.sortLibelle}
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                s.adopte ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {s.sortLibelle ?? (s.adopte ? "Adopté" : "Rejeté")}
            </span>
          </div>
          <h1 className="titre mt-2 text-2xl leading-snug text-encre">{s.titre}</h1>

          <div className="mt-4">
            <BarreVote scrutin={s} legende />
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {s.dossierUid && (
              <Link href={`/loi/${s.dossierUid}`} className="lien">
                {s.dossierTitre ?? "Voir le dossier législatif"}
              </Link>
            )}
            {s.amendementUid && (
              <Link href={`/amendement/${encodeURIComponent(s.amendementUid)}`} className="lien">
                Voir l&apos;amendement mis aux voix
              </Link>
            )}
          </div>
        </header>

        <section className="border border-bordure bg-white p-5">
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="titre text-xl text-encre">Position par groupe</h2>
            <span className="ref-mono text-xs text-gris">
              {s.totalPositions.toLocaleString("fr-FR")} positions nominatives
            </span>
          </div>
          <p className="mb-4 text-xs text-gris">
            Ventilation des votes nominatifs enregistrés par l&apos;Assemblée nationale.
            {/* chaîne unique : évite que le JSX rogne les espaces autour des expressions */}
            {s.totalPositions !== exprimes &&
              ` Le résultat officiel compte ${exprimes.toLocaleString("fr-FR")} voix exprimées, la table nominative ${s.totalPositions.toLocaleString("fr-FR")} positions — non-votants, délégations et corrections de vote expliquent l'écart.`}
          </p>

          {s.parGroupe.length === 0 ? (
            <p className="border border-dashed border-bordure bg-fond px-4 py-6 text-sm text-gris">
              Les positions nominatives de ce scrutin ne figurent pas dans les données restaurées.
            </p>
          ) : (
            <table className="w-full text-sm">
              <caption className="sr-only">
                Nombre de députés par position de vote et par groupe politique
              </caption>
              <thead>
                <tr className="border-b border-bordure text-left text-xs uppercase tracking-wide text-gris">
                  <th scope="col" className="py-2 pr-2 font-medium">
                    Groupe
                  </th>
                  <th scope="col" className="py-2 px-2 text-right font-medium">
                    Pour
                  </th>
                  <th scope="col" className="py-2 px-2 text-right font-medium">
                    Contre
                  </th>
                  <th scope="col" className="py-2 px-2 text-right font-medium">
                    Abst.
                  </th>
                  <th scope="col" className="py-2 pl-2 text-right font-medium">
                    Non-votants
                  </th>
                </tr>
              </thead>
              <tbody>
                {s.parGroupe.map((g) => (
                  <tr key={g.groupe} className="border-b border-bordure last:border-0">
                    <th scope="row" className="py-2 pr-2 text-left font-normal">
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: g.couleur }}
                        />
                        <span className="font-medium text-encre">{g.groupe}</span>
                        <span className="hidden truncate text-xs text-gris sm:inline">{g.libelle}</span>
                      </span>
                    </th>
                    <td className="ref-mono py-2 px-2 text-right text-green-700">{g.pour || "—"}</td>
                    <td className="ref-mono py-2 px-2 text-right text-red-700">{g.contre || "—"}</td>
                    <td className="ref-mono py-2 px-2 text-right text-gris">{g.abstention || "—"}</td>
                    <td className="ref-mono py-2 pl-2 text-right text-gris">{g.nonVotant || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
