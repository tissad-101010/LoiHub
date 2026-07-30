import Link from "next/link";

// Bande « ce que LoiHub permet » (home) : 4 cartes qui expliquent le produit en
// une phrase chacune — inspirée des visuels du défi. Chaque carte mène à une
// page réelle qui illustre la fonctionnalité.

const FEATURES = [
  {
    titre: "Diff législatif",
    texte: "Visualisez précisément ce qui a été ajouté, modifié ou supprimé dans le texte, version par version.",
    href: "/lois",
    action: "Explorer les lois",
    chip: "bg-bleu-100 text-bleu",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M9 5H5v14h4M15 5h4v14h-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3v18" strokeDasharray="3 3" />
      </svg>
    ),
  },
  {
    titre: "Qui a écrit quoi",
    texte: "Chaque modification a un auteur : découvrez qui a proposé chaque amendement et qui a influencé chaque article.",
    href: "/deputes",
    action: "Voir les députés",
    chip: "bg-green-100 text-green-700",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    titre: "Votes en toute transparence",
    texte: "Les scrutins publics, texte par texte et amendement par amendement — la position de chaque député est publique.",
    href: "/statistiques",
    action: "Voir les statistiques",
    chip: "bg-purple-100 text-purple-600",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 12l2.5 2.5L16 9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    titre: "Explications en langage clair",
    texte: "Résumés par IA, lexique du jargon parlementaire au survol, et réponses à vos questions sur chaque texte.",
    href: "/a-propos",
    action: "Comment ça marche",
    chip: "bg-amber-100 text-amber-700",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M12 3a7 7 0 0 1 4 12.7c-.6.5-1 1.2-1 2V19h-6v-1.3c0-.8-.4-1.5-1-2A7 7 0 0 1 12 3z" strokeLinejoin="round" />
        <path d="M10 22h4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HomeFeatures() {
  return (
    <section aria-label="Ce que LoiHub permet">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <Link
            key={f.titre}
            href={f.href}
            className="group flex flex-col border border-bordure bg-white p-5 transition hover:border-bleu hover:shadow-[0_6px_20px_rgba(0,0,18,0.07)]"
          >
            <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${f.chip}`}>
              {f.icone}
            </span>
            <h3 className="text-sm font-semibold text-encre">{f.titre}</h3>
            <p className="mt-1.5 flex-1 text-xs leading-relaxed text-gris">{f.texte}</p>
            <span className="mt-3 text-xs font-semibold text-bleu group-hover:underline">
              {f.action} →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
