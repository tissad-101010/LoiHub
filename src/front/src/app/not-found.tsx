import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-col items-center p-16 text-center">
        <div className="text-6xl font-bold text-slate-200">404</div>
        <h1 className="mt-2 text-2xl font-bold text-encre">Page introuvable</h1>
        <p className="mt-3 text-gris">
          Cette page n&apos;existe pas ou a été déplacée. Revenez à l&apos;accueil pour explorer les lois.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-bleu px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          ← Retour à l&apos;accueil
        </Link>
      </main>
    </div>
  );
}
