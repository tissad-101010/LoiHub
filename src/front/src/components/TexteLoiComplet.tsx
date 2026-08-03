"use client";
import { useState } from "react";
import type { Article } from "@/lib/types";

// Lecture suivie du texte : tous les articles amendés à la file.
//
// Replié par défaut, et SANS conteneur à défilement interne : une boîte
// `overflow-y-auto` au milieu de la page capturait la molette et empêchait de
// faire défiler la page depuis cette zone. Ici le contenu s'insère dans le flux
// normal, on le déplie quand on veut le lire.
export default function TexteLoiComplet({
  titreLoi,
  articles,
}: {
  titreLoi: string;
  articles: Article[];
}) {
  const [ouvert, setOuvert] = useState(false);
  if (articles.length === 0) return null;

  return (
    <section className="border border-bordure bg-white">
      <h2>
        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
          aria-expanded={ouvert}
          className="flex w-full items-center justify-between gap-3 p-5 text-left transition hover:bg-fond"
        >
          <span>
            <span className="titre block text-xl text-encre">Lire le texte à la file</span>
            <span className="mt-0.5 block text-xs text-gris">
              Les {articles.length} articles amendés, dans l&apos;ordre de la loi — dernière version
              publiée.
            </span>
          </span>
          <span aria-hidden className="shrink-0 text-gris">
            {ouvert ? "▲" : "▼"}
          </span>
        </button>
      </h2>

      {ouvert && (
        <div className="space-y-5 border-t border-bordure px-5 py-5">
          <h3 className="text-lg font-bold text-encre">{titreLoi}</h3>
          {articles.map((a) => (
            <article key={a.numero}>
              <h4 className="text-sm font-semibold text-encre">{a.titre}</h4>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-encre">{a.texte}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
