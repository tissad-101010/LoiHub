"use client";
import { useMemo, useState } from "react";
import type { Article, StatutAmendement } from "@/lib/types";
import { dotStatutClass, statutExplication } from "@/lib/ui";

// Sommaire des articles amendés d'un texte.
//
// Pourquoi une liste et pas un arbre Titre / Chapitre / Article : les divisions
// du texte ne figurent pas dans le jeu de données. `LawText` ne publie que des
// clés « Article N » — reconstituer une hiérarchie serait de l'invention. On
// affiche donc les articles réels, avec de quoi les départager : nombre
// d'amendements et sort du dernier amendement adopté.
export default function Sommaire({
  articles,
  articleActif,
  onSelect,
}: {
  articles: Article[];
  articleActif: string;
  onSelect: (numero: string) => void;
}) {
  const [filtre, setFiltre] = useState("");

  const visibles = useMemo(() => {
    const f = filtre.trim().replace(/^art\.?\s*/i, "");
    if (!f) return articles;
    return articles.filter((a) => a.numero.startsWith(f));
  }, [articles, filtre]);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-encre">Articles amendés</h3>
        <span className="ref-mono text-xs text-gris">{articles.length}</span>
      </div>

      <label className="mt-2 flex items-center gap-1.5 border border-bordure bg-white px-2 py-1.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0 text-gris">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          inputMode="numeric"
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          placeholder="Aller à l'article…"
          aria-label="Filtrer les articles par numéro"
          className="w-full min-w-0 bg-transparent text-xs text-encre placeholder:text-gris focus:outline-none"
        />
      </label>

      {/* La liste défile, pas la page : le sommaire reste à côté du texte. */}
      <ul className="mt-2 max-h-[46vh] min-h-0 overflow-y-auto lg:max-h-[calc(100vh-22rem)]">
        {visibles.map((a) => {
          const actif = a.numero === articleActif;
          const statut: StatutAmendement | undefined = a.amendementActuel?.statut;
          return (
            <li key={a.numero}>
              <button
                type="button"
                onClick={() => onSelect(a.numero)}
                aria-current={actif ? "true" : undefined}
                className={`flex w-full items-center gap-2 border-l-2 py-1.5 pl-2 pr-1 text-left text-sm transition ${
                  actif
                    ? "border-bleu bg-bleu-100 font-semibold text-bleu"
                    : "border-transparent text-encre hover:border-bordure hover:bg-fond"
                }`}
              >
                {statut ? (
                  <span
                    title={`Dernier amendement adopté : ${statut} — ${statutExplication[statut]}`}
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotStatutClass[statut]}`}
                  />
                ) : (
                  <span className="h-1.5 w-1.5 shrink-0" />
                )}
                <span className="flex-1 truncate">{a.titre}</span>
                <span className="ref-mono shrink-0 text-[11px] text-gris">{a.nbAmendements}</span>
              </button>
            </li>
          );
        })}
        {visibles.length === 0 && (
          <li className="px-2 py-3 text-xs text-gris">Aucun article ne commence par « {filtre} ».</li>
        )}
      </ul>

      <p className="mt-2 border-t border-bordure pt-2 text-[11px] leading-relaxed text-gris">
        Le chiffre est le nombre d&apos;amendements déposés sur l&apos;article ; la pastille, le sort
        du dernier amendement adopté.
      </p>
    </div>
  );
}
