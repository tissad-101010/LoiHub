"use client";

// Error boundary racine : attrape toute exception non gérée d'une page
// (rendu serveur inclus) et affiche un écran propre dans le style du site,
// à la place de l'écran d'erreur technique brut de Next.

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // trace serveur/console pour le diagnostic — jamais montrée au visiteur
    console.error("[LoiHub] erreur non gérée :", error);
  }, [error]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex max-w-2xl flex-col items-center p-16 text-center">
        <div className="text-6xl font-bold text-slate-200">Oups</div>
        <h1 className="mt-2 text-2xl font-bold text-encre">Une erreur est survenue</h1>
        <p className="mt-3 text-gris">
          Quelque chose s&apos;est mal passé lors du chargement de cette page. Vous pouvez
          réessayer, ou revenir à l&apos;accueil.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-gray-300">réf. {error.digest}</p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-bleu px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="rounded-lg border border-bordure px-4 py-2 text-sm font-medium text-encre hover:bg-fond"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
