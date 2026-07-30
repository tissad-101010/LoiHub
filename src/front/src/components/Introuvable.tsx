import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

// Écran « ressource introuvable » partagé par les not-found.tsx de segment :
// rendu avec un vrai statut HTTP 404 (via notFound()), contrairement à
// l'ancien rendu inline qui répondait 200.
export default function Introuvable({
  titre,
  message,
}: {
  titre: string;
  message: string;
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl p-10">
        <div className="ref-mono text-xs uppercase tracking-widest text-gris">Erreur 404</div>
        <h1 className="titre mt-2 text-2xl text-encre">{titre}</h1>
        <p className="mt-4 text-gris">{message}</p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="lien">
            ← Retour à l&apos;accueil
          </Link>
          <Link href="/lois" className="lien">
            Parcourir le registre législatif
          </Link>
        </div>
      </main>
    </div>
  );
}
