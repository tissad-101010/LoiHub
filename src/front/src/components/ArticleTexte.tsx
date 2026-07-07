"use client";
import { useEffect, useMemo, useState } from "react";
import { Article, Amendement } from "@/lib/types";
import { badgeStatutClass } from "@/lib/ui";
import DiffViewer from "./DiffViewer";
import TexteDiff from "./TexteDiff";
import ResumeIABouton from "./ResumeIABouton";

// `article.texte` vaut ce placeholder quand l'open data AN ne fournit pas le
// texte articulé (cf. lib/data.ts) : dans ce cas, rien à résumer.
const TEXTE_INDISPONIBLE = "Le texte de cet article n'est pas encore disponible";
const texteResumable = (t: string) => t.trim().length >= 80 && !t.startsWith(TEXTE_INDISPONIBLE);

// Au-delà de ce nombre d'alinéas, l'article est long (ex. article 2 d'une loi de
// finances) : on le replie par défaut pour ne pas noyer le lecteur.
const APERCU_ALINEAS = 12;

export default function ArticleTexte({
  article,
  amendement,
}: {
  article: Article;
  amendement?: Amendement;
}) {
  const am = amendement;
  const texte = article.texte;

  // Découpage en alinéas (numérotés, façon lignes de code).
  const alineas = useMemo(() => texte.split(/\n+/).map((l) => l.trim()).filter(Boolean), [texte]);

  // Texte adopté « en séance » : n'affiche que les modifs, avec des marqueurs.
  const marqueurs = alineas.filter((l) => /\(\s*(?:non\s*modifi|supprim)/i.test(l)).length;
  const estTexteSeance = alineas.length > 0 && marqueurs / alineas.length >= 0.34;

  // Alinéas explicitement visés par l'amendement affiché. Source prioritaire :
  // le champ officiel AN `alinea` (ex. « Alinéa 13 », « Après l'alinéa 7 »).
  // À défaut, on lit les « alinéa N » cités dans le dispositif.
  const alineasVises = useMemo(() => {
    const set = new Set<number>();
    if (am?.alinea) for (const m of am.alinea.matchAll(/(\d+)/g)) set.add(parseInt(m[1], 10));
    if (set.size === 0 && am?.dispositif)
      for (const m of am.dispositif.matchAll(/alin[ée]as?\s*n?°?\s*(\d+)/gi)) set.add(parseInt(m[1], 10));
    return set;
  }, [am?.alinea, am?.dispositif]);

  const [deplie, setDeplie] = useState(false);
  useEffect(() => {
    setDeplie(false);
  }, [article.numero, texte]);

  const estLong = alineas.length > APERCU_ALINEAS;
  // Si l'amendement vise un alinéa au-delà de l'aperçu, on déplie pour le montrer.
  const forceDeplie = [...alineasVises].some((n) => n > APERCU_ALINEAS);
  const montreTout = deplie || forceDeplie;
  const visibles = estLong && !montreTout ? alineas.slice(0, APERCU_ALINEAS) : alineas;
  const indisponible = texte.startsWith(TEXTE_INDISPONIBLE);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="titre text-xl text-encre">{article.titre}</h2>
        {am && (
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${badgeStatutClass[am.statut]}`}>
            {am.statut}
          </span>
        )}
      </div>

      {estTexteSeance && (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Texte adopté en séance : seules les parties modifiées sont reproduites.
          <span className="font-medium"> « (Non modifiée) »</span> = inchangé,
          <span className="font-medium"> « (Supprimé) »</span> = retiré.
        </p>
      )}

      {am && alineasVises.size > 0 && (
        <p className="mb-3 text-xs text-gris">
          L&apos;amendement n°{am.numero} vise :{" "}
          {[...alineasVises].sort((a, b) => a - b).map((n, i) => (
            <span key={n}>
              {i > 0 && " · "}
              <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">alinéa {n}</span>
            </span>
          ))}
        </p>
      )}

      {/* Résumé IA en tête : saisir l'essentiel en langage clair avant le texte juridique. */}
      {texteResumable(texte) && <ResumeIABouton texte={texte} />}

      {indisponible ? (
        <p className="text-sm leading-relaxed text-gris">{texte}</p>
      ) : (
        <ol className="overflow-hidden rounded-lg border border-bordure">
          {visibles.map((al, i) => {
            const num = i + 1;
            const vise = alineasVises.has(num);
            return (
              <li
                key={i}
                className={`flex gap-3 px-2 py-1 ${vise ? "bg-amber-50" : i % 2 ? "bg-fond/40" : ""}`}
              >
                <span className="w-7 shrink-0 select-none text-right font-mono text-[11px] leading-6 text-gray-300">
                  {num}
                </span>
                <span className="text-sm leading-6 text-encre">{al}</span>
              </li>
            );
          })}
        </ol>
      )}

      {estLong && !forceDeplie && (
        <button
          type="button"
          onClick={() => setDeplie((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 rounded-lg border border-bordure px-3 py-1.5 text-sm font-medium text-encre transition hover:bg-fond"
        >
          {deplie ? "Réduire l'article ↑" : `Voir les ${alineas.length} alinéas ↓`}
        </button>
      )}

      <div className="mt-4">
        {article.diffTexte && article.diffTexte.length > 0 && (
          <TexteDiff diff={article.diffTexte} info={article.diffTexteInfo} />
        )}

        <DiffViewer amendement={am} />
      </div>
    </div>
  );
}
