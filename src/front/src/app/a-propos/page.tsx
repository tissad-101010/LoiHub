import SiteHeader from "@/components/SiteHeader";

const ENJEUX = [
  { besoin: "Comprendre ce qui change dans un article", avant: "Jargon juridique, PDF dispersés", loihub: "Diff ligne à ligne, résumé en langage clair" },
  { besoin: "Retracer un amendement", avant: "Recherche manuelle dans les dossiers", loihub: "Frise chronologique par article" },
  { besoin: "Suivre le parcours d'un texte", avant: "Dossier législatif brut", loihub: "Timeline verticale illustrée" },
  { besoin: "Identifier qui a influencé un article", avant: "Quasi impossible sans dépouillement", loihub: "Classement par % de contribution" },
  { besoin: "Sourcer une modification", avant: "Croisement manuel de plusieurs bases", loihub: "Bloc « Origine de cette modification »" },
];

const STACK = [
  { couche: "Framework", techno: "Next.js (App Router)" },
  { couche: "UI", techno: "Tailwind CSS" },
  { couche: "ORM / DB", techno: "Prisma + PostgreSQL" },
  { couche: "Files d'attente", techno: "BullMQ + Redis (ioredis)" },
  { couche: "Validation", techno: "Zod" },
  { couche: "Tests", techno: "Vitest" },
];

const SOURCES = [
  { categorie: "Dossiers législatifs", source: "data.assemblee-nationale.fr", url: "https://data.assemblee-nationale.fr/travaux-parlementaires/dossiers-legislatifs", format: "XML/JSON", perimetre: "XVIIe législature (+ XIV-XVI)" },
  { categorie: "Dossiers législatifs", source: "data.senat.fr/dosleg", url: "https://data.senat.fr/dosleg/", format: "PostgreSQL", perimetre: "depuis oct. 1977" },
  { categorie: "Amendements (source principale)", source: "data.assemblee-nationale.fr — tous les amendements", url: "https://data.assemblee-nationale.fr/travaux-parlementaires/amendements/tous-les-amendements", format: "XML/JSON", perimetre: "toutes lectures, XVIIe législature" },
  { categorie: "Amendements", source: "data.senat.fr/ameli", url: "https://data.senat.fr/ameli/", format: "PostgreSQL", perimetre: "temps réel, depuis 2001/2010" },
  { categorie: "Députés en exercice", source: "data.assemblee-nationale.fr — deputes-en-exercice", url: "https://data.assemblee-nationale.fr/acteurs/deputes-en-exercice", format: "CSV/XML", perimetre: "depuis le 8 juillet 2024" },
  { categorie: "Historique des députés", source: "data.assemblee-nationale.fr — historique-des-deputes", url: "https://data.assemblee-nationale.fr/acteurs/historique-des-deputes", format: "XML/JSON", perimetre: "depuis juin 1997" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export default function AProposPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <div className="rounded-2xl bg-slate-900 p-8 text-white">
          <h1 className="text-2xl font-bold">LoiHub</h1>
          <p className="text-blue-300">Le GitHub de la loi</p>
          <p className="mt-4 text-sm italic text-white/70">
            Suivre une loi comme on suit un dépôt de code : commits, diffs, contributeurs.
          </p>
        </div>

        <Section title="Description">
          <p className="text-sm leading-relaxed text-slate-700">
            LoiHub est une plateforme qui permet aux citoyens, parlementaires et juristes de suivre en temps réel
            l&apos;évolution d&apos;une loi ou d&apos;une proposition de loi : quels articles ont changé, qui a
            proposé quoi (amendements), et pourquoi.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            La métaphore est celle de GitHub — diffs, historique, contributeurs — mais le projet{" "}
            <strong>n&apos;utilise pas git</strong>. Le backend repose sur des données relationnelles construites à
            partir des jeux de données ouverts de l&apos;Assemblée nationale et du Sénat, interrogées via SQL pour
            reconstituer les versions successives d&apos;un texte et la chaîne des amendements qui y ont mené.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Projet développé dans le cadre du Hackathon Assemblée nationale 2026 (
            <a href="https://hackathon2026.assemblee-nationale.fr/" className="text-blue-600 hover:underline">
              hackathon2026.assemblee-nationale.fr
            </a>
            ).
          </p>
        </Section>

        <Section title="Enjeux">
          <p className="mb-4 text-sm leading-relaxed text-slate-700">
            Suivre la vie d&apos;une loi aujourd&apos;hui reste un exercice réservé aux initiés. LoiHub répond à ce
            manque en traitant chaque loi comme un dépôt de code : versionné, diffable, attribuable.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500">
                  <th className="py-2 pr-3 font-medium">Besoin</th>
                  <th className="py-2 pr-3 font-medium">Approche actuelle</th>
                  <th className="py-2 font-medium">LoiHub</th>
                </tr>
              </thead>
              <tbody>
                {ENJEUX.map((e) => (
                  <tr key={e.besoin} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 pr-3 text-slate-700">{e.besoin}</td>
                    <td className="py-2 pr-3 text-gray-500">{e.avant}</td>
                    <td className="py-2 text-slate-700">{e.loihub}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Fonctionnalités de la maquette">
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li><strong>En-tête</strong> — numéro, titre, statut, dates clés, lien vers le dossier législatif</li>
            <li><strong>Parcours législatif</strong> — timeline : dépôt → commission → 1ère lecture AN → Sénat → 2nde lecture → adoption → promulgation</li>
            <li><strong>Stats globales</strong> — amendements (total + adoptés), députés impliqués, scrutins publics, heures de débat</li>
            <li><strong>Explorateur de texte</strong> — sommaire Titre &gt; Chapitre &gt; Article, avec l&apos;origine de chaque modification</li>
            <li><strong>Diff viewer</strong> — comparaison entre deux versions d&apos;un article (supprimé / ajouté)</li>
            <li><strong>Historique des amendements</strong> — texte initial → amendements successifs → version finale</li>
            <li><strong>« Qui a influencé cet article ? »</strong> — classement des députés par % de contribution</li>
          </ul>
          <p className="mt-4 text-xs text-gray-500">
            Le résumé d&apos;amendement en langage clair est généré par IA et affiché directement dans le bloc
            « Origine de cette modification ».
          </p>
        </Section>

        <Section title="Architecture technique">
          <p className="mb-3 text-sm leading-relaxed text-slate-700">
            <strong>Front-end</strong> — codé à la main à partir de la maquette existante, avec Next.js et Tailwind.
          </p>
          <p className="mb-4 text-sm leading-relaxed text-slate-700">
            <strong>Données</strong> — ingestion des jeux de données ouverts de l&apos;Assemblée nationale (et
            éventuellement du Sénat) dans une base PostgreSQL via Prisma, puis requêtes SQL pour reconstituer les
            versions successives d&apos;un article, la chaîne des amendements et les stats agrégées.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <tbody>
                {STACK.map((s) => (
                  <tr key={s.couche} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 pr-3 text-gray-500">{s.couche}</td>
                    <td className="py-2 text-slate-700">{s.techno}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Sources de données">
          <p className="mb-4 text-sm text-gray-500">
            Catalogue de référence :{" "}
            <a
              href="https://hackathon2026.assemblee-nationale.fr/ressources"
              className="text-blue-600 hover:underline"
            >
              Hackathon AN 2026 — Ressources
            </a>
          </p>
          <ul className="space-y-3 text-sm">
            {SOURCES.map((s) => (
              <li key={s.source} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="font-medium text-slate-900">{s.categorie}</div>
                <a href={s.url} className="text-blue-600 hover:underline">{s.source}</a>
                <div className="text-xs text-gray-500">{s.format} · {s.perimetre}</div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Contributions">
          <p className="text-sm text-slate-700">
            Projet développé dans le cadre du Hackathon Assemblée nationale 2026.
          </p>
        </Section>
      </main>
    </div>
  );
}
