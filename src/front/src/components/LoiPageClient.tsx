"use client";
import { useMemo, useState } from "react";
import type { DiffLigne } from "@/lib/types";

// diff ligne-à-ligne (LCS) entre deux listes d'alinéas -> DiffLigne[]
function diffLines(a: string[], b: string[]): DiffLigne[] {
  const A = a.slice(0, 400);
  const B = b.slice(0, 400);
  const n = A.length,
    m = B.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffLigne[] = [];
  let i = 0,
    j = 0,
    k = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) out.push({ numero: ++k, texte: A[i++], type: "inchange" }), j++;
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ numero: ++k, texte: A[i++], type: "supprime" });
    else out.push({ numero: ++k, texte: B[j++], type: "ajoute" });
  }
  while (i < n) out.push({ numero: ++k, texte: A[i++], type: "supprime" });
  while (j < m) out.push({ numero: ++k, texte: B[j++], type: "ajoute" });
  return out;
}
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
    numero: projet.numeroAffiche ?? projet.numero,
    titre: projet.titre,
    statut: projet.statut,
    dateDepot: projet.dateDepot,
    datePromulgation: projet.datePromulgation,
    version: projet.version,
    dossierUrl: projet.dossierUrl,
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

  // Texte de l'article TEL QU'À L'ÉTAPE sélectionnée : on prend la dernière
  // version datée <= date de l'étape, et le diff introduit vs la version d'avant.
  const articleAffiche = useMemo(() => {
    const vers = article?.versionsTexte;
    if (!article || !etape?.dateIso || !vers?.length) return article;
    let idx = -1;
    for (let i = 0; i < vers.length; i++) {
      if (vers[i].dateIso && vers[i].dateIso <= etape.dateIso) idx = i;
    }
    if (idx < 0) return article; // aucune version connue à cette date
    const cur = vers[idx];
    // On remonte jusqu'à la dernière version au contenu RÉELLEMENT différent :
    // une transmission en navette re-« dépose » un texte identique, ce qui
    // produisait des diffs vides et déroutants ("adopté → déposé, aucun écart").
    const curKey = cur.alineas.join("\n");
    let prev = null;
    for (let i = idx - 1; i >= 0; i--) {
      if (vers[i].alineas.join("\n") !== curKey) {
        prev = vers[i];
        break;
      }
    }
    return {
      ...article,
      texte: cur.alineas.join("\n\n"),
      diffTexte: prev ? diffLines(prev.alineas, cur.alineas) : undefined,
      diffTexteInfo: prev ? { avant: prev.label, apres: cur.label } : undefined,
    };
  }, [article, etape]);

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
              📍 Vous consultez le texte à l&apos;étape : <span className="font-medium">{etape.label}</span>
              {etape.date && <> — {etape.date}</>}
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
                  <ArticleTexte article={articleAffiche ?? article} amendement={amendementAffiche} diff={diff} />
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
