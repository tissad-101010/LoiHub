import type { Metadata } from "next";
import Link from "next/link";
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
  if (!projet) return { title: "Dossier introuvable" };
  return {
    title: projet.titre,
    description: `${projet.titre} — ${projet.statut}. ${projet.stats.amendements.toLocaleString("fr-FR")} amendements, ${projet.stats.deputesImpliques} députés impliqués.`,
  };
}

export default async function LoiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projet = await getProjetLoi(decodeURIComponent(id));

  if (!projet) {
    return (
      <main className="mx-auto max-w-3xl p-10">
        <h1 className="text-2xl font-bold text-encre">Dossier introuvable</h1>
        <p className="mt-4 text-gris">Aucun dossier avec l&apos;identifiant {id}.</p>
        <Link href="/" className="mt-6 inline-block text-bleu">
          ← Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  const sommaire = buildSommaire(projet.articles);
  return <LoiPageClient projet={projet} sommaire={sommaire} />;
}
