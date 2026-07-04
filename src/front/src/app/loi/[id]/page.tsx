import Link from "next/link";
import LoiPageClient from "@/components/LoiPageClient";
import { getProjetLoi, buildSommaire } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function LoiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projet = await getProjetLoi(decodeURIComponent(id));

  if (!projet) {
    return (
      <main className="mx-auto max-w-3xl p-10">
        <h1 className="text-2xl font-bold text-slate-900">Dossier introuvable</h1>
        <p className="mt-4 text-slate-600">Aucun dossier avec l&apos;identifiant {id}.</p>
        <Link href="/" className="mt-6 inline-block text-blue-600">
          ← Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  const sommaire = buildSommaire(projet.articles);
  return <LoiPageClient projet={projet} sommaire={sommaire} />;
}
