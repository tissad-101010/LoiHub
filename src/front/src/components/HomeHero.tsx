import Link from "next/link";
import HomeSearch from "@/components/HomeSearch";
import VitrineDiff from "@/components/VitrineDiff";
import type { ExtraitVitrine } from "@/lib/data";
import type { LoiResume } from "@/lib/types";
import { libelleRef } from "@/lib/ui";

export interface StatsGlobales {
  dossiers: number;
  amendements: number;
  deputes: number;
  scrutins: number;
}

export default function HomeHero({
  featured,
  stats,
  extrait,
}: {
  featured?: LoiResume;
  stats: StatsGlobales;
  extrait: ExtraitVitrine | null;
}) {
  const chiffres = [
    { valeur: stats.dossiers, label: "dossiers législatifs" },
    { valeur: stats.amendements, label: "amendements" },
    { valeur: stats.deputes, label: "députés" },
    { valeur: stats.scrutins, label: "scrutins publics" },
  ];
  const refFeatured = featured
    ? libelleRef(
        featured.type,
        featured.numeroAffiche ?? featured.numero.match(/N(\d+)/)?.[1] ?? featured.numero,
        featured.chambre
      )
    : "";

  return (
    <section>
      <div className="grid grid-cols-1 gap-10 border-b border-bordure pb-10 lg:grid-cols-12">
        {/* Colonne éditoriale */}
        <div className="apparait lg:col-span-5">
          <div className="ref-mono text-xs uppercase tracking-widest text-bleu">
            Données ouvertes · Assemblée Nationale
          </div>
          <h1 className="titre mt-4 text-[2rem] leading-[1.1] text-encre sm:text-5xl sm:leading-[1.05]">
            Suivre la loi comme
            <br className="hidden sm:block" /> on suit un dépôt de code.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-gris">
            Versions, différences ligne à ligne, amendements, exposés des motifs, cosignataires et
            votes nominatifs — reconstitués à partir des données officielles de l&apos;Assemblée
            Nationale.
          </p>

          <div className="mt-7 max-w-2xl">
            <HomeSearch />
          </div>

          {featured && (
            <p className="mt-5 text-sm text-gris">
              <span className="font-semibold text-rouge">La plus amendée&nbsp;:</span>{" "}
              <Link href={`/loi/${featured.numero}`} className="lien font-medium">
                {featured.titre}
              </Link>{" "}
              <span className="ref-mono text-xs">
                {refFeatured} · {featured.amendements.toLocaleString("fr-FR")} amendements
              </span>
            </p>
          )}
        </div>

        {/* Démonstration : un vrai diff, pas une capture d'écran */}
        <div
          className="apparait lg:col-span-7"
          style={{ "--delai": "0.12s" } as React.CSSProperties}
        >
          {extrait ? (
            <>
              <div className="mb-2 text-xs uppercase tracking-wide text-gris">
                Un changement réel, tiré de la base
              </div>
              <VitrineDiff extrait={extrait} />
            </>
          ) : (
            <div className="flex h-full items-center border border-dashed border-bordure bg-fond p-6 text-sm text-gris">
              Aucun texte articulé n&apos;est disponible en base pour illustrer une comparaison.
            </div>
          )}
        </div>
      </div>

      {/* Chiffres-clés — bande structurée */}
      <dl
        className="apparait grid grid-cols-2 divide-x divide-bordure border-b border-bordure sm:grid-cols-4"
        style={{ "--delai": "0.2s" } as React.CSSProperties}
      >
        {chiffres.map((s) => (
          <div key={s.label} className="px-5 py-5 first:pl-0">
            <dt className="ref-mono text-3xl font-bold tracking-tight text-bleu">
              {s.valeur.toLocaleString("fr-FR")}
            </dt>
            <dd className="mt-1 text-sm text-gris">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
