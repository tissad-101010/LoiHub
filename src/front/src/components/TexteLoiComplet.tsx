import { Article } from "@/lib/types";

type SommaireData = { titre: string; chapitres: { nom: string | null; articles: string[] }[] }[];

export default function TexteLoiComplet({
  titreLoi,
  articles,
  sommaire,
}: {
  titreLoi: string;
  articles: Article[];
  sommaire: SommaireData;
}) {
  const texteParNumero = new Map(articles.map((a) => [a.numero, a]));
  const numeroFromLabel = (label: string) => label.replace("Article ", "");

  // Aperçu : cette vue sert de survol du texte. Le texte intégral (et le diff
  // par version) est disponible en sélectionnant une étape du parcours.
  const APERCU = 420;
  const apercu = (t: string) => (t.length > APERCU ? t.slice(0, APERCU).trimEnd() + "…" : t);

  return (
    <div className="border border-bordure bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="titre text-xl text-encre">Texte de la loi — articles amendés</h2>
        <span className="text-xs text-gris">{articles.length} articles</span>
      </div>
      <p className="mb-4 text-xs text-gris">
        Sélectionnez une étape du parcours législatif ci-dessus pour explorer l&apos;historique et les amendements
        article par article.
      </p>
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-2">
        <h1 className="text-lg font-bold text-encre">{titreLoi}</h1>
        {sommaire.map((t) => (
          <div key={t.titre}>
            <h3 className="mb-2 titre text-xl text-encre">{t.titre}</h3>
            {t.chapitres.map((c, i) => (
              <div key={i} className="mb-3 pl-2">
                {c.nom && <h4 className="mb-2 text-sm font-medium text-gris">{c.nom}</h4>}
                {c.articles.map((label) => {
                  const article = texteParNumero.get(numeroFromLabel(label));
                  return (
                    <div key={label} className="mb-3 pl-2">
                      <div className="text-sm font-medium text-encre">{label}</div>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-encre">
                        {article?.texte ? apercu(article.texte) : "Texte non renseigné."}
                      </p>
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
