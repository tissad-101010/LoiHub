import Link from "next/link";
import HomeSearch from "@/components/HomeSearch";
import type { LoiResume } from "@/lib/types";
import { COULEUR_ACTEUR, libelleRef } from "@/lib/ui";

const STATS = [
  { valeur: "2 926", label: "dossiers législatifs" },
  { valeur: "121 109", label: "amendements" },
  { valeur: "577", label: "députés" },
  { valeur: "7 979", label: "scrutins publics" },
];

export default function HomeHero({ featured }: { featured?: LoiResume }) {
  const c = featured ? COULEUR_ACTEUR[featured.etape.acteur] : null;
  const refFeatured = featured
    ? libelleRef(featured.type, featured.numeroAffiche ?? featured.numero.match(/N(\d+)/)?.[1] ?? featured.numero, featured.chambre)
    : "";

  return (
    <section>
      <div className="grid grid-cols-1 gap-10 border-b border-bordure pb-10 lg:grid-cols-12">
        {/* Colonne éditoriale */}
        <div className="lg:col-span-7">
          <div className="ref-mono text-xs uppercase tracking-widest text-bleu">
            Données ouvertes · Assemblée nationale
          </div>
          <h1 className="titre mt-4 text-[2rem] leading-[1.1] text-encre sm:text-5xl sm:leading-[1.05] lg:text-6xl">
            Suivre la loi comme
            <br className="hidden sm:block" /> on suit un dépôt de code.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-gris sm:text-lg">
            Versions, différences ligne à ligne, amendements, exposés des motifs, cosignataires et votes nominatifs —
            reconstitués à partir des données officielles de l&apos;Assemblée nationale.
          </p>

          <div className="mt-8 max-w-2xl">
            <HomeSearch />
          </div>
        </div>

        {/* Loi à la une — tuile plate façon DSFR */}
        {featured && c && (
          <div className="lg:col-span-5">
            <Link
              href={`/loi/${featured.numero}`}
              className="group flex h-full flex-col border border-bordure bg-fond p-6 transition hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,18,0.08)]"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rouge">
                <span className="h-1.5 w-1.5 rounded-full bg-rouge" />
                La plus amendée en ce moment
              </div>
              <h2 className="titre mt-3 text-2xl leading-snug text-encre">{featured.titre}</h2>
              <div className="ref-mono mt-1 text-xs text-gris">{refFeatured}</div>

              <span
                className="mt-4 inline-flex w-fit items-center gap-1.5 px-2 py-1 text-xs font-medium"
                style={{ backgroundColor: c.clair, color: c.accent }}
              >
                {featured.etape.label}
              </span>

              <div className="mt-auto flex gap-8 border-t border-bordure pt-5">
                <div>
                  <div className="ref-mono text-2xl font-bold text-encre">
                    {featured.amendements.toLocaleString("fr-FR")}
                  </div>
                  <div className="text-xs text-gris">amendements</div>
                </div>
                <div>
                  <div className="ref-mono text-2xl font-bold text-encre">{featured.deputesImpliques}</div>
                  <div className="text-xs text-gris">députés</div>
                </div>
              </div>
              <span className="mt-4 text-sm font-semibold text-bleu group-hover:underline">
                Explorer cette loi →
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Chiffres-clés — bande structurée */}
      <dl className="grid grid-cols-2 divide-x divide-bordure border-b border-bordure sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="px-5 py-5 first:pl-0">
            <dt className="ref-mono text-3xl font-bold tracking-tight text-bleu">{s.valeur}</dt>
            <dd className="mt-1 text-sm text-gris">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
