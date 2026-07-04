"use client";
import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import LoiHeader from "@/components/LoiHeader";
import ParcoursHorizontal from "@/components/ParcoursHorizontal";
import StatsCards from "@/components/StatsCards";
import Sommaire from "@/components/Sommaire";
import ArticleTexte from "@/components/ArticleTexte";
import HistoriqueAmendements from "@/components/HistoriqueAmendements";
import Influenceurs from "@/components/Influenceurs";
import TexteLoiComplet from "@/components/TexteLoiComplet";
import { Amendement, ProjetLoi, StatutAmendement } from "@/lib/types";

type SommaireData = { titre: string; chapitres: { nom: string | null; articles: string[] }[] }[];

const numeroFromLabel = (label: string) => label.replace("Article ", "");

export default function LoiPageClient({
  projet,
  sommaire,
}: {
  projet: ProjetLoi;
  sommaire: SommaireData;
}) {
  const loi = {
    numero: projet.numero,
    titre: projet.titre,
    statut: projet.statut,
    dateDepot: projet.dateDepot,
    datePromulgation: projet.datePromulgation,
    version: projet.version,
  };
  const parcours = projet.parcours;
  const stats = projet.stats;
  const articles = projet.articles;

  const [etapeActive, setEtapeActive] = useState<number | null>(null);
  const [articleActifNumero, setArticleActifNumero] = useState(articles[0]?.numero ?? "");
  const [amendementActif, setAmendementActif] = useState<Amendement | null>(null);

  const etape = etapeActive !== null ? parcours[etapeActive] : null;
  const estVueSimple = etape?.acteur === "promulgation" || etape?.acteur === "depot";
  const article = articles.find((a) => a.numero === articleActifNumero);

  const historique = article?.historique ?? [];
  const influenceurs = article?.influenceurs ?? [];
  const amendementAffiche = amendementActif ?? article?.amendementActuel;
  const diff = amendementAffiche?.diff;

  const statutParArticle: Record<string, StatutAmendement> = Object.fromEntries(
    articles.filter((a) => a.amendementActuel).map((a) => [a.numero, a.amendementActuel!.statut])
  );

  function selectEtape(index: number) {
    setEtapeActive(index === -1 ? null : index);
    setAmendementActif(null);
  }
  function selectArticle(label: string) {
    setArticleActifNumero(numeroFromLabel(label));
    setAmendementActif(null);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-5 p-6">
        <LoiHeader loi={loi} />
        <StatsCards stats={stats} />
        <ParcoursHorizontal etapes={parcours} etapeActive={etapeActive} onSelect={selectEtape} />

        {(!etape || estVueSimple) && (
          <TexteLoiComplet
            titreLoi={loi.titre}
            version={etape ? etape.version : loi.version}
            articles={articles}
            sommaire={sommaire}
          />
        )}

        {etape && !estVueSimple && article && (
          <>
            <div className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
              Version consultée : <span className="font-medium">{etape.version}</span> — {etape.label} ({etape.date})
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 font-semibold text-slate-900">Explorer le texte de loi</h2>
              <div className="grid grid-cols-4 gap-6">
                <div className="col-span-1">
                  <Sommaire
                    sommaire={sommaire}
                    articleActif={`Article ${articleActifNumero}`}
                    statutParArticle={statutParArticle}
                    onSelect={selectArticle}
                  />
                </div>
                <div className="col-span-3">
                  <ArticleTexte article={article} amendement={amendementAffiche} diff={diff} />
                </div>
              </div>
            </div>

            <HistoriqueAmendements
              historique={historique}
              amendementActifNumero={amendementAffiche?.numero}
              etapeDate={etape.date}
              onSelect={setAmendementActif}
            />

            <Influenceurs influenceurs={influenceurs} />
          </>
        )}
      </main>
    </div>
  );
}
