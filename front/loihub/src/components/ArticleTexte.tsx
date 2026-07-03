import { Article, Amendement, DiffLigne } from "@/lib/types";
import { badgeStatutClass } from "@/lib/ui";
import DiffViewer from "./DiffViewer";

export default function ArticleTexte({
  article,
  amendement,
  diff,
}: {
  article: Article;
  amendement?: Amendement;
  diff?: { avant: DiffLigne[]; apres: DiffLigne[] };
}) {
  const am = amendement;
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900">{article.titre}</h2>
        {am && (
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${badgeStatutClass[am.statut]}`}>
            {am.statut}
          </span>
        )}
      </div>
      <p className="mb-4 text-sm leading-relaxed text-slate-700">{article.texte}</p>

      {am?.resumeIA && (
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="mb-1 text-sm font-medium text-slate-900">Résumé de l&apos;amendement par IA</div>
          <p className="text-sm text-slate-700">{am.resumeIA}</p>
        </div>
      )}

      <DiffViewer diff={diff} amendement={am} />
    </div>
  );
}
