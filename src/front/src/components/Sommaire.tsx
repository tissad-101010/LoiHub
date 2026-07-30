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
      <h3 className="mb-1 titre text-xl text-encre">Sommaire</h3>
      <p className="mb-3 text-xs text-gris">
        La pastille indique le sort du dernier amendement sur l&apos;article.
      </p>
      {sommaire.map((t) => (
        <div key={t.titre} className="mb-2">
          <div className="py-1 text-xs font-medium uppercase tracking-wide text-gris">{t.titre}</div>
          {t.chapitres.map((c, i) => (
            <div key={i}>
              {c.nom && <div className="py-1 text-gris">{c.nom}</div>}
              {/* grille compacte de puces : tout le sommaire tient à l'écran */}
              <div className="grid grid-cols-3 gap-1">
                {c.articles.map((a) => {
                  const numero = a.replace("Article ", "");
                  const statut = statutParArticle?.[numero];
                  const actif = articleActif === a;
                  return (
                    <button
                      key={a}
                      onClick={() => onSelect(a)}
                      title={statut ? `${a} — dernier amendement : ${statut}` : a}
                      aria-current={actif ? "true" : undefined}
                      className={`flex items-center justify-center gap-1.5 rounded border px-1 py-1.5 text-xs transition ${
                        actif
                          ? "border-bleu bg-bleu font-semibold text-white"
                          : "border-bordure text-encre hover:border-bleu hover:bg-fond"
                      }`}
                    >
                      <span className="truncate">{numero === a ? a : `Art. ${numero}`}</span>
                      {statut && (
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            actif ? "bg-white" : dotStatutClass[statut]
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
