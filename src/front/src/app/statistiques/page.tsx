import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import RepartitionGroupes from "@/components/RepartitionGroupes";
import ParlementaireAvatar from "@/components/ParlementaireAvatar";
import { getStatistiques, getDossiersPage } from "@/lib/data";
import { photoParlementaireUrl } from "@/lib/parlementaires";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Statistiques",
  description:
    "L'activité législative de la XVIIe législature en chiffres : amendements par groupe, textes les plus discutés, députés les plus actifs.",
};

// barre horizontale simple : trait fin, extrémité arrondie, libellé texte à
// gauche (l'identité est portée par le texte, pas par la couleur seule)
function Barre({ valeur, max, couleur }: { valeur: number; max: number; couleur: string }) {
  const largeur = max > 0 ? (valeur / max) * 100 : 0;
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-fond-alt">
      <div
        className="h-full rounded-full"
        style={{ width: `${largeur}%`, backgroundColor: couleur }}
      />
    </div>
  );
}

export default async function StatistiquesPage() {
  const [stats, { items: topLois }] = await Promise.all([
    getStatistiques(),
    getDossiersPage({ page: 1, perPage: 8 }),
  ]);
  const { chiffres, parGroupe, topDeputes, parMois } = stats;
  const tauxAdoption = chiffres.amendements
    ? Math.round((chiffres.adoptes / chiffres.amendements) * 1000) / 10
    : 0;
  const maxLoi = Math.max(...topLois.map((l) => l.amendements), 1);
  const maxDepute = Math.max(...topDeputes.map((d) => d.total), 1);
  const maxMois = Math.max(...parMois.map((m) => m.total), 1);

  const tuiles = [
    { valeur: chiffres.dossiers.toLocaleString("fr-FR"), label: "dossiers législatifs" },
    { valeur: chiffres.amendements.toLocaleString("fr-FR"), label: "amendements déposés" },
    { valeur: `${tauxAdoption.toLocaleString("fr-FR")} %`, label: `taux d'adoption (${chiffres.adoptes.toLocaleString("fr-FR")} adoptés)` },
    { valeur: chiffres.scrutins.toLocaleString("fr-FR"), label: "scrutins publics" },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-6 p-6 pb-16">
        <div>
          <span className="tricolore-accent mb-3" />
          <h1 className="titre text-3xl text-encre">La législature en chiffres</h1>
          <p className="mt-2 max-w-2xl text-sm text-gris">
            L&apos;activité législative de la XVIIe législature, reconstituée depuis les données
            ouvertes de l&apos;Assemblée nationale.
          </p>
        </div>

        {/* Chiffres-clés */}
        <dl className="grid grid-cols-2 divide-x divide-bordure border-y border-bordure lg:grid-cols-4">
          {tuiles.map((t) => (
            <div key={t.label} className="px-5 py-5 first:pl-0">
              <dt className="ref-mono text-3xl font-bold tracking-tight text-bleu">{t.valeur}</dt>
              <dd className="mt-1 text-sm text-gris">{t.label}</dd>
            </div>
          ))}
        </dl>

        {/* Amendements par groupe — réutilise le composant de la page loi */}
        <RepartitionGroupes groupes={parGroupe} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Textes les plus discutés */}
          <section className="border border-bordure bg-white p-5">
            <h2 className="titre mb-1 text-xl text-encre">Les textes les plus discutés</h2>
            <p className="mb-4 text-xs text-gris">Nombre d&apos;amendements déposés par texte.</p>
            <ol className="space-y-3">
              {topLois.map((l, i) => (
                <li key={l.numero}>
                  <Link href={`/loi/${l.numero}`} className="group block">
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate text-sm text-encre group-hover:text-bleu group-hover:underline">
                        <span className="ref-mono mr-1.5 text-xs text-gris">{i + 1}.</span>
                        {l.titre}
                      </span>
                      <span className="ref-mono shrink-0 text-sm font-semibold text-encre">
                        {l.amendements.toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <Barre valeur={l.amendements} max={maxLoi} couleur="var(--color-bleu)" />
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {/* Députés les plus actifs */}
          <section className="border border-bordure bg-white p-5">
            <h2 className="titre mb-1 text-xl text-encre">Les députés les plus actifs</h2>
            <p className="mb-4 text-xs text-gris">
              Auteurs du plus grand nombre d&apos;amendements (adoptés inclus).
            </p>
            <ol className="space-y-3">
              {topDeputes.map((d, i) => (
                <li key={d.id} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-right text-xs text-gris">{i + 1}</span>
                  <ParlementaireAvatar
                    depute={{ id: d.id, nom: d.nom, groupe: d.groupe ?? "", couleur: d.couleur, photoUrl: photoParlementaireUrl(d.id) }}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      {/^PA\d+$/.test(d.id) ? (
                        <Link
                          href={`/depute/${encodeURIComponent(d.id)}`}
                          className="min-w-0 truncate text-sm text-encre hover:text-bleu hover:underline"
                        >
                          {d.nom} <span className="text-xs text-gris">{d.groupe ?? ""}</span>
                        </Link>
                      ) : (
                        <span className="min-w-0 truncate text-sm text-encre">
                          {d.nom} <span className="text-xs text-gris">{d.groupe ?? ""}</span>
                        </span>
                      )}
                      <span className="ref-mono shrink-0 text-sm font-semibold text-encre">
                        {d.total.toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <Barre valeur={d.total} max={maxDepute} couleur={d.couleur} />
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Activité mensuelle */}
        <section className="border border-bordure bg-white p-5">
          <h2 className="titre mb-1 text-xl text-encre">Le rythme de la législature</h2>
          <p className="mb-4 text-xs text-gris">
            Amendements déposés par mois — les pics correspondent aux grands textes (budget,
            financement de la sécurité sociale…).
          </p>
          <div className="flex h-40 items-end gap-1 overflow-x-auto pb-1">
            {parMois.map((m) => (
              <div
                key={m.mois}
                className="group relative flex h-full min-w-[14px] flex-1 flex-col items-center justify-end"
                title={`${m.libelle} : ${m.total.toLocaleString("fr-FR")} amendements`}
              >
                <div
                  className="w-full rounded-t-[4px] bg-bleu transition group-hover:bg-bleu-survol"
                  style={{ height: `${Math.max((m.total / maxMois) * 100, 1.5)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gris">
            <span>{parMois[0]?.libelle}</span>
            <span>{parMois[parMois.length - 1]?.libelle}</span>
          </div>
        </section>

        <p className="text-xs text-gris">
          Chiffres calculés en direct sur la base LoiHub (données ouvertes de l&apos;Assemblée
          nationale, XVIIe législature). Les amendements sans auteur identifié ne sont pas
          comptés dans les répartitions par groupe et par député.
        </p>
      </main>
    </div>
  );
}
