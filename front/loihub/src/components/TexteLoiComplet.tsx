import { Article } from "@/lib/types";
import { sommaire } from "@/lib/mock-data";

export default function TexteLoiComplet({
  titreLoi,
  version,
  articles,
}: {
  titreLoi: string;
  version: string;
  articles: Article[];
}) {
  const texteParNumero = new Map(articles.map((a) => [a.numero, a]));
  const numeroFromLabel = (label: string) => label.replace("Article ", "");

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Texte intégral de la loi</h2>
        <span className="text-xs text-gray-400">Version {version}</span>
      </div>
      <p className="mb-4 text-xs text-gray-500">
        Sélectionnez une étape du parcours législatif ci-dessus pour explorer l&apos;historique et les amendements
        article par article.
      </p>
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-2">
        <h1 className="text-lg font-bold text-slate-900">{titreLoi}</h1>
        {sommaire.map((t) => (
          <div key={t.titre}>
            <h3 className="mb-2 font-semibold text-slate-800">{t.titre}</h3>
            {t.chapitres.map((c, i) => (
              <div key={i} className="mb-3 pl-2">
                {c.nom && <h4 className="mb-2 text-sm font-medium text-slate-600">{c.nom}</h4>}
                {c.articles.map((label) => {
                  const article = texteParNumero.get(numeroFromLabel(label));
                  return (
                    <div key={label} className="mb-3 pl-2">
                      <span className="text-sm font-medium text-slate-900">{label}. </span>
                      <span className="text-sm leading-relaxed text-slate-700">
                        {article?.texte ?? "Texte non renseigné."}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
