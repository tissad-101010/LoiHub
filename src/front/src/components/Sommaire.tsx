"use client";
import { StatutAmendement } from "@/lib/types";
import { dotStatutClass } from "@/lib/ui";

type SommaireData = { titre: string; chapitres: { nom: string | null; articles: string[] }[] }[];

export default function Sommaire({
  sommaire,
  articleActif,
  statutParArticle,
  onSelect,
}: {
  sommaire: SommaireData;
  articleActif: string;
  statutParArticle?: Record<string, StatutAmendement>;
  onSelect: (article: string) => void;
}) {
  return (
    <div className="text-sm">
      <h3 className="mb-3 font-semibold text-slate-900">Sommaire</h3>
      {sommaire.map((t) => (
        <div key={t.titre} className="mb-2">
          <div className="py-1 text-gray-500">{t.titre}</div>
          {t.chapitres.map((c, i) => (
            <div key={i} className="pl-2">
              {c.nom && <div className="py-1 text-gray-500">{c.nom}</div>}
              {c.articles.map((a) => {
                const numero = a.replace("Article ", "");
                const statut = statutParArticle?.[numero];
                return (
                  <button
                    key={a}
                    onClick={() => onSelect(a)}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1 pl-4 text-left ${
                      articleActif === a
                        ? "bg-blue-600 font-medium text-white"
                        : "text-slate-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="flex-1">{a}</span>
                    {statut && (
                      <span
                        title={statut}
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          articleActif === a ? "bg-white" : dotStatutClass[statut]
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
