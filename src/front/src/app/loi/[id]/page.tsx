import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LoiPageClient from "@/components/LoiPageClient";
import { getProjetLoi, buildSommaire } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const projet = await getProjetLoi(decodeURIComponent(id));
  // notFound() dès les métadonnées : avec un loading.tsx, le shell (statut 200)
  // partirait avant le notFound() du corps de page — ici le 404 est garanti.
  if (!projet) notFound();
  return {
    title: projet.titre,
    description: `${projet.titre} — ${projet.statut}. ${projet.stats.amendements.toLocaleString("fr-FR")} amendements, ${projet.stats.deputesImpliques} députés impliqués.`,
  };
}

export default async function LoiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projet = await getProjetLoi(decodeURIComponent(id));

  // vrai 404 (voir not-found.tsx) au lieu d'une page d'erreur servie en 200
  if (!projet) notFound();

  const sommaire = buildSommaire(projet.articles);
  return <LoiPageClient projet={projet} sommaire={sommaire} />;
}
