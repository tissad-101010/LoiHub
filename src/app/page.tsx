"use client";

import { useEffect, useState } from "react";

type DatabaseData = {
  sourceFiles: any[];
  deputies: any[];
  dossiers: any[];
  laws: any[];
  lawVersions: any[];
  amendments: any[];
  debates: any[];
  votes: any[];
  entityEdges: any[];
};

export default function DatabasePage() {
  const [data, setData] = useState<DatabaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await fetch("/api/admin/database");
      const json = await res.json();

      setData(json);
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return <main className="p-8">Chargement de la base...</main>;
  }

  if (!data) {
    return <main className="p-8">Aucune donnée trouvée.</main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="mb-8 text-3xl font-bold">Base de données LoiHub</h1>

      <Stats data={data} />

      <Section title="Lois" items={data.laws} renderItem={(law) => (
        <>
          <h3 className="font-bold">{law.title}</h3>
          <p className="text-sm text-slate-400">UID : {law.uid}</p>
          <p className="text-sm">Statut : {law.status}</p>
          <p className="text-sm">
            Amendements : {law.amendments?.length ?? 0} · Débats :{" "}
            {law.debates?.length ?? 0} · Votes : {law.votes?.length ?? 0}
          </p>
        </>
      )} />

      <Section title="Amendements" items={data.amendments} renderItem={(amendment) => (
        <>
          <h3 className="font-bold">
            Amendement {amendment.numeroLong ?? amendment.uid}
          </h3>
          <p className="text-sm text-slate-400">
            Article : {amendment.article ?? "Non précisé"}
          </p>
          <p className="text-sm">Statut : {amendment.status}</p>
          <p className="text-sm">
            Auteur : {amendment.deputy?.name ?? "Inconnu"}
          </p>
          <p className="mt-2 line-clamp-3 text-sm text-slate-300">
            {stripHtml(amendment.content) ?? "Aucun contenu"}
          </p>
        </>
      )} />

      <Section title="Députés" items={data.deputies} renderItem={(deputy) => (
        <>
          <h3 className="font-bold">{deputy.name}</h3>
          <p className="text-sm text-slate-400">UID : {deputy.uid}</p>
          <p className="text-sm">Groupe : {deputy.group ?? "Non renseigné"}</p>
          <p className="text-sm">
            Amendements : {deputy.amendments?.length ?? 0} · Votes :{" "}
            {deputy.votes?.length ?? 0}
          </p>
        </>
      )} />

      <Section title="Dossiers législatifs" items={data.dossiers} renderItem={(dossier) => (
        <>
          <h3 className="font-bold">{dossier.title ?? "Sans titre"}</h3>
          <p className="text-sm text-slate-400">UID : {dossier.uid}</p>
          <p className="text-sm">Lois liées : {dossier.laws?.length ?? 0}</p>
        </>
      )} />

      <Section title="Votes" items={data.votes} renderItem={(vote) => (
        <>
          <h3 className="font-bold">{vote.value}</h3>
          <p className="text-sm">Député : {vote.deputy?.name}</p>
          <p className="text-sm">
            Loi : {vote.law?.title ?? "Aucune"} · Amendement :{" "}
            {vote.amendment?.numeroLong ?? "Aucun"}
          </p>
        </>
      )} />
    </main>
  );
}

function Stats({ data }: { data: DatabaseData }) {
  const stats = [
    ["Sources", data.sourceFiles.length],
    ["Lois", data.laws.length],
    ["Amendements", data.amendments.length],
    ["Députés", data.deputies.length],
    ["Dossiers", data.dossiers.length],
    ["Versions", data.lawVersions.length],
    ["Débats", data.debates.length],
    ["Votes", data.votes.length],
    ["Relations", data.entityEdges.length],
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  items,
  renderItem,
}: {
  title: string;
  items: any[];
  renderItem: (item: any) => React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xl font-bold">
        {title} <span className="text-slate-500">({items.length})</span>
      </h2>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-slate-800 bg-slate-900 p-4"
          >
            {renderItem(item)}
          </article>
        ))}
      </div>
    </section>
  );
}

function stripHtml(value?: string | null) {
  if (!value) return null;
  return value.replace(/<[^>]*>/g, "").trim();
}