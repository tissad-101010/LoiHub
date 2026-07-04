import { Article, Amendement, DiffLigne } from "@/lib/types";
import { badgeStatutClass } from "@/lib/ui";
import DiffViewer from "./DiffViewer";
import TexteDiff from "./TexteDiff";
import ResumeIABouton from "./ResumeIABouton";

// `article.texte` vaut ce placeholder quand l'open data AN ne fournit pas le
// texte articulé (cf. lib/data.ts) : dans ce cas, rien à résumer.
const TEXTE_INDISPONIBLE = "Le texte de cet article n'est pas encore disponible";
const texteResumable = (t: string) => t.trim().length >= 80 && !t.startsWith(TEXTE_INDISPONIBLE);

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
      <p className="mb-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">{article.texte}</p>

      {texteResumable(article.texte) && <ResumeIABouton texte={article.texte} />}

      {article.diffTexte && article.diffTexte.length > 0 && (
        <TexteDiff diff={article.diffTexte} info={article.diffTexteInfo} />
      )}

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
