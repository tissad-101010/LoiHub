import {
  Search,
  ArrowRight,
  Code2,
  Users,
  Sparkles,
  FileText,
  MessageCircle,
  Scale,
  Bot,
  ShieldCheck,
  Landmark,
} from "lucide-react";

const featuredLaws = [
  {
    title: "Projet de loi pour le logement abordable",
    status: "Adoptée",
    date: "Déposée le 12 janv. 2024 · Promulguée le 22 mai 2024",
    amendments: "1 248 amendements",
    debates: "17 débats",
    votes: "24 votes",
  },
  {
    title: "Proposition de loi sur la transition énergétique",
    status: "En cours",
    date: "Déposée le 3 févr. 2024 · En discussion",
    amendments: "842 amendements",
    debates: "9 débats",
    votes: "12 votes",
  },
  {
    title: "Projet de loi de finances pour 2025",
    status: "Adoptée",
    date: "Déposée le 15 sept. 2024 · Promulguée le 20 déc. 2024",
    amendments: "2 341 amendements",
    debates: "23 débats",
    votes: "37 votes",
  },
];

const features = [
  {
    icon: <Scale />,
    title: "Suivez l’évolution des lois",
    text: "Visualisez toutes les versions d’un texte et les modifications apportées.",
  },
  {
    icon: <Users />,
    title: "Comprenez chaque modification",
    text: "Affichez les différences ligne par ligne et l’origine de chaque changement.",
  },
  {
    icon: <ShieldCheck />,
    title: "Identifiez les auteurs",
    text: "Découvrez qui a proposé chaque amendement et son impact.",
  },
  {
    icon: <MessageCircle />,
    title: "Explorez les débats et votes",
    text: "Accédez aux comptes rendus, aux interventions et aux résultats des votes.",
  },
  {
    icon: <Bot />,
    title: "IA à votre service",
    text: "Posez vos questions et obtenez des explications simples et fiables.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-[#07122f] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#314cff55,transparent_35%),linear-gradient(to_bottom,#07122f,#0a1433)]" />
        <div className="absolute inset-0 opacity-20 bg-[url('/assembly-bg.jpg')] bg-cover bg-center" />

        <div className="relative mx-auto max-w-7xl px-6 py-6">
          <header className="flex items-center justify-between gap-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight">LoiHub</h1>
              <p className="text-sm text-white/80">Le GitHub de la loi</p>
            </div>

            <nav className="hidden items-center gap-10 text-sm font-medium lg:flex">
              <a>Explorer</a>
              <a>Lois</a>
              <a>Amendements</a>
              <a>Députés</a>
              <a>À propos</a>
              <a>API</a>
            </nav>

            <div className="hidden items-center gap-3 xl:flex">
              <div className="flex w-80 items-center rounded-lg border border-white/10 bg-white/10 px-4">
                <input
                  className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-white/50"
                  placeholder="Rechercher une loi, un amendement..."
                />
                <Search size={18} className="text-white/60" />
              </div>

              <button className="rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold">
                Se connecter
              </button>

              <button className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold">
                S’inscrire
              </button>
            </div>
          </header>

          <div className="grid items-center gap-12 py-20 lg:grid-cols-[1fr_1.25fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/80">
                <span className="text-blue-300">Transparence</span>
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                <span>Démocratie</span>
                <span className="h-1.5 w-1.5 rounded-full bg-purple-300" />
                <span>Compréhension</span>
              </div>

              <h2 className="max-w-xl text-5xl font-black leading-tight tracking-tight md:text-6xl">
                Explorez les lois comme du{" "}
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  code source
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
                LoiHub vous permet de comprendre comment les lois sont écrites,
                modifiées et adoptées, ligne par ligne. Chaque amendement a une
                histoire.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button className="flex items-center gap-4 rounded-xl bg-blue-600 px-8 py-4 font-bold shadow-xl shadow-blue-900/40">
                  Explorer une loi <ArrowRight size={20} />
                </button>

                <button className="flex items-center gap-4 rounded-xl border border-white/15 bg-white/5 px-8 py-4 font-bold">
                  Voir une démo
                </button>
              </div>

              <div className="mt-9 grid gap-6 sm:grid-cols-3">
                <HeroPoint icon={<Code2 />} title="Historique complet" />
                <HeroPoint icon={<Users />} title="Auteurs et votes" />
                <HeroPoint icon={<Sparkles />} title="IA explicative" />
              </div>
            </div>

            <DiffPreview />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.12fr]">
          <FeaturedLaws />

          <div className="space-y-6">
            <StatsCard />
            <AskAiCard />
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroPoint({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-blue-300">
        {icon}
      </div>
      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/65">
          Des informations claires et transparentes.
        </p>
      </div>
    </div>
  );
}

function DiffPreview() {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur">
      <div className="flex items-center gap-4 border-b border-white/10 px-6 py-5 text-sm">
        <span>Projet de loi n°1234</span>
        <span className="text-white/40">›</span>
        <span>Article 12</span>
        <span className="text-white/40">›</span>
        <span>Amendement n°452</span>
        <span className="rounded-md bg-green-500/20 px-3 py-1 text-xs font-bold text-green-300">
          Adopté
        </span>
      </div>

      <div className="grid md:grid-cols-2">
        <DiffColumn title="Version précédente (v3.1)" type="old" />
        <DiffColumn title="Version actuelle (v3.2)" type="new" />
      </div>

      <div className="grid gap-4 border-t border-white/10 p-4 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-200 to-slate-200" />
          <div className="text-sm">
            <p className="font-bold">Amendement n°452</p>
            <p className="text-white/70">Auteur : Jean Dupont</p>
            <p className="text-white/70">Groupe : Ensemble</p>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 p-4 text-sm">
          <p className="font-bold">Résultat du vote</p>
          <p className="mt-2 text-green-300">Adopté</p>
          <p>312 pour</p>
          <p>198 contre</p>
        </div>

        <div className="rounded-xl bg-white/5 p-4 text-sm">
          <p className="font-bold">Pourquoi ce changement ?</p>
          <p className="mt-2 text-white/70">
            Cet amendement augmente le montant de l’aide afin de mieux répondre
            à la hausse des coûts du logement.
          </p>
          <p className="mt-2 text-blue-300">Voir le débat</p>
        </div>
      </div>
    </div>
  );
}

function DiffColumn({
  title,
  type,
}: {
  title: string;
  type: "old" | "new";
}) {
  const isOld = type === "old";

  return (
    <div className="border-white/10 p-5 md:border-r">
      <p className="mb-4 text-sm text-white/80">{title}</p>

      <div className="overflow-hidden rounded-xl bg-white/10 font-mono text-sm">
        <div className="flex">
          <div className="w-10 bg-white/5 p-4 text-white/40">1</div>
          <div className="flex-1 p-4">
            Le montant de l’aide est fixé à
            <br />
            <span
              className={
                isOld
                  ? "mt-2 block bg-red-500/20 p-2 text-red-100"
                  : "mt-2 block bg-green-500/20 p-2 text-green-100"
              }
            >
              {isOld ? "- 500 euros" : "+ 700 euros"} par mois pour les ménages
            </span>
            dont les ressources sont inférieures au plafond fixé par décret.
          </div>
        </div>

        <div className="flex border-t border-white/10">
          <div className="w-10 bg-white/5 p-4 text-white/40">4</div>
          <div className="flex-1 p-4">
            Cette aide est versée mensuellement.
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        {icon}
      </div>
      <h3 className="font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}

function FeaturedLaws() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-black">Lois à la une</h2>
        <a className="flex items-center gap-2 text-sm font-medium text-blue-600">
          Voir toutes les lois <ArrowRight size={16} />
        </a>
      </div>

      <div className="space-y-5">
        {featuredLaws.map((law) => (
          <article key={law.title} className="flex gap-4">
            <div className="h-20 w-32 shrink-0 rounded-lg bg-gradient-to-br from-blue-200 to-slate-300" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-bold">{law.title}</h3>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  {law.status}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">{law.date}</p>

              <div className="mt-3 flex flex-wrap gap-5 text-sm text-slate-600">
                <span>{law.amendments}</span>
                <span>{law.debates}</span>
                <span>{law.votes}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatsCard() {
  const stats = [
    ["5 782", "Lois et propositions"],
    ["128 456", "Amendements"],
    ["1 245", "Députés"],
    ["24 982", "Votes enregistrés"],
  ];

  return (
    <section className="rounded-xl border border-indigo-100 bg-white p-7 shadow-sm">
      <h2 className="mb-6 text-xl font-black">LoiHub en chiffres</h2>

      <div className="grid gap-6 sm:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label}>
            <FileText className="mb-3 text-blue-600" size={24} />
            <p className="text-2xl font-black">{value}</p>
            <p className="mt-1 text-sm text-slate-600">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AskAiCard() {
  return (
    <section className="flex flex-col gap-6 rounded-xl border border-indigo-100 bg-white p-7 shadow-sm md:flex-row md:items-center">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-indigo-50">
        <Bot size={56} className="text-indigo-600" />
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-black">Une question sur une loi ?</h2>
        <p className="mt-2 text-sm text-slate-600">
          Interrogez notre IA et obtenez des réponses claires et sourcées.
        </p>

        <div className="mt-4 flex gap-3">
          <input
            className="h-12 flex-1 rounded-lg border border-slate-200 px-4 text-sm outline-none"
            placeholder="Ex : Pourquoi l’amendement n°452 a-t-il été adopté ?"
          />
          <button className="flex items-center gap-3 rounded-lg bg-indigo-600 px-6 font-bold text-white">
            Poser la question <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}