import Link from "next/link";

// Pied de page façon DSFR : bloc Marianne, navigation, sources officielles et
// mentions. Présent sur toutes les pages via le layout racine.

const NAVIGATION = [
  { href: "/", label: "Accueil" },
  { href: "/lois", label: "Toutes les lois" },
  { href: "/deputes", label: "Députés" },
  { href: "/statistiques", label: "Statistiques" },
  { href: "/a-propos", label: "À propos" },
];

const SOURCES = [
  {
    href: "https://data.assemblee-nationale.fr",
    label: "data.assemblee-nationale.fr",
  },
  {
    href: "https://www.assemblee-nationale.fr",
    label: "assemblee-nationale.fr",
  },
  {
    href: "https://hackathon2026.assemblee-nationale.fr/",
    label: "Hackathon AN 2026",
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-bleu bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          {/* Bloc identité */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="drapeau overflow-hidden rounded-[1px] ring-1 ring-black/5" aria-hidden>
                <span className="bg-bleu" />
                <span className="bg-white" />
                <span className="bg-rouge" />
              </span>
              <div className="leading-[1.05]">
                <div className="text-[13px] font-bold uppercase tracking-wide text-encre">
                  République
                  <br />
                  Française
                </div>
                <div className="mt-0.5 text-[10px] italic text-gris">Liberté · Égalité · Fraternité</div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-gris">
              <span className="font-semibold text-encre">LoiHub</span> — suivre la loi comme on
              suit un dépôt de code. Projet citoyen indépendant construit sur les données
              ouvertes de l&apos;Assemblée nationale, développé dans le cadre du Hackathon
              Assemblée nationale 2026.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Pied de page">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-encre">
              Navigation
            </div>
            <ul className="space-y-1.5 text-sm">
              {NAVIGATION.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gris hover:text-bleu hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sources */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-encre">
              Sources officielles
            </div>
            <ul className="space-y-1.5 text-sm">
              {SOURCES.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gris hover:text-bleu hover:underline"
                  >
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-bordure pt-4 text-xs leading-relaxed text-gris">
          Les données affichées proviennent des jeux de données ouverts de l&apos;Assemblée
          nationale (XVIIe législature), sous licence ouverte. LoiHub est un outil de
          visualisation indépendant : en cas de doute, le{" "}
          <a
            href="https://www.assemblee-nationale.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="lien"
          >
            site officiel de l&apos;Assemblée nationale
          </a>{" "}
          fait foi.
        </div>
      </div>
    </footer>
  );
}
