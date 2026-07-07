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
    <div className="text-sm md:sticky md:top-4 md:max-h-[75vh] md:overflow-y-auto md:pr-1">
      <h3 className="mb-3 titre text-xl text-encre">Sommaire</h3>
      {sommaire.map((t) => (
        <div key={t.titre} className="mb-2">
          <div className="py-1 text-gris">{t.titre}</div>
          {t.chapitres.map((c, i) => (
            <div key={i} className="pl-2">
              {c.nom && <div className="py-1 text-gris">{c.nom}</div>}
              {c.articles.map((a) => {
                const numero = a.replace("Article ", "");
                const statut = statutParArticle?.[numero];
                return (
                  <button
                    key={a}
                    onClick={() => onSelect(a)}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1 pl-4 text-left ${
                      articleActif === a
                        ? "bg-bleu font-medium text-white"
                        : "text-encre hover:bg-fond-alt"
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
