"use client";
import { useEffect, useMemo, useState } from "react";
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
import { texteEstPartiel } from "@/lib/ui";
import SiteHeader from "@/components/SiteHeader";
import Fil from "@/components/Fil";
import LoiHeader from "@/components/LoiHeader";
import ParcoursHorizontal from "@/components/ParcoursHorizontal";
import StatsCards from "@/components/StatsCards";
import RepartitionGroupes from "@/components/RepartitionGroupes";
import ConseilConstit from "@/components/ConseilConstit";
import ScrutinsLoi from "@/components/ScrutinsLoi";
import Sommaire from "@/components/Sommaire";
import ArticleTexte from "@/components/ArticleTexte";
import HistoriqueAmendements from "@/components/HistoriqueAmendements";
import Influenceurs from "@/components/Influenceurs";
import TexteLoiComplet from "@/components/TexteLoiComplet";
import { Amendement, Depute, ProjetLoi, StatutAmendement, VersionArticle } from "@/lib/types";

type SommaireData = { titre: string; chapitres: { nom: string | null; articles: string[] }[] }[];
type ArticleDetail = {
  historique: Amendement[];
  influenceurs: { depute: Depute; part: number }[];
  versionsTexte: VersionArticle[];
};

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
    statutVariant: projet.statutVariant,
    loiPromulguee: projet.loiPromulguee,
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

  // Historique + influenceurs de l'article actif : hors du payload initial
  // (page loi allégée), chargés à la demande via GET /api/article et mis en
  // cache par numéro d'article pour ne pas refetcher au re-clic.
  const [details, setDetails] = useState<Record<string, ArticleDetail>>({});
  const [detailLoading, setDetailLoading] = useState(false);
  const enrichi = article ? details[article.numero] : undefined;

  useEffect(() => {
    // on ne charge le détail que lorsqu'on explore un article à une étape précise
    if (!articleActifNumero || etape === null || estVueSimple) return;
    if (details[articleActifNumero]) return; // déjà en cache
    let annule = false;
    setDetailLoading(true);
    fetch(
      `/api/article?dossier=${encodeURIComponent(projet.numero)}&numero=${encodeURIComponent(articleActifNumero)}`
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: ArticleDetail) => {
        if (!annule) setDetails((prev) => ({ ...prev, [articleActifNumero]: data }));
      })
      .catch(() => {
        if (!annule)
          setDetails((prev) => ({
            ...prev,
            [articleActifNumero]: { historique: [], influenceurs: [], versionsTexte: [] },
          }));
      })
      .finally(() => {
        if (!annule) setDetailLoading(false);
      });
    return () => {
      annule = true;
    };
  }, [articleActifNumero, etape, estVueSimple, details, projet.numero]);

  const historique = enrichi?.historique ?? [];
  const influenceurs = enrichi?.influenceurs ?? [];
  const amendementAffiche = amendementActif ?? article?.amendementActuel;

  // Texte de l'article TEL QU'À L'ÉTAPE sélectionnée : on prend la dernière
  // version datée <= date de l'étape, et le diff introduit vs la version d'avant.
  const articleAffiche = useMemo(() => {
    const vers = enrichi?.versionsTexte;
    if (!article || !etape?.dateIso || !vers?.length) return article;
    let idx = -1;
    for (let i = 0; i < vers.length; i++) {
      if (vers[i].dateIso && vers[i].dateIso <= etape.dateIso) idx = i;
    }
    if (idx < 0) return article; // aucune version connue à cette date
    const cur = vers[idx];
    // Texte de séance (marqueurs « (Non modifiée) ») : on l'affiche tel quel mais
    // on NE le compare PAS (le diff ferait croire que tout a été supprimé).
    if (texteEstPartiel(cur.alineas)) {
      return { ...article, texte: cur.alineas.join("\n\n"), diffTexte: undefined, diffTexteInfo: undefined };
    }
    // On remonte jusqu'à la dernière version COMPLÈTE au contenu réellement
    // différent : une navette re-« dépose » un texte identique (diff vide), et
    // un texte de séance en marqueurs fausserait la comparaison.
    const curKey = cur.alineas.join("\n");
    let prev = null;
    for (let i = idx - 1; i >= 0; i--) {
      if (!texteEstPartiel(vers[i].alineas) && vers[i].alineas.join("\n") !== curKey) {
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
  }, [article, etape, enrichi]);

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
        <Fil items={[{ label: "Accueil", href: "/" }, { label: "Lois", href: "/lois" }, { label: loi.titre }]} />
        <LoiHeader loi={loi} />
        <StatsCards stats={stats} />
        {projet.repartitionGroupes.length > 0 && (
          <RepartitionGroupes groupes={projet.repartitionGroupes} />
        )}
        {projet.scrutins.length > 0 && <ScrutinsLoi scrutins={projet.scrutins} />}
        {projet.conseilConstit && <ConseilConstit cc={projet.conseilConstit} />}
        <ParcoursHorizontal etapes={parcours} etapeActive={etapeActive} onSelect={selectEtape} />

        {(!etape || estVueSimple) && (
          <TexteLoiComplet
            titreLoi={loi.titre}
            articles={articles}
            sommaire={sommaire}
          />
        )}

        {etape && !estVueSimple && article && (
          <>
            <div className="rounded-lg bg-bleu-100 px-4 py-2 text-sm text-bleu">
              📍 Vous consultez le texte à l&apos;étape : <span className="font-medium">{etape.label}</span>
              {etape.date && <> — {etape.date}</>}
            </div>

            <div className="border border-bordure bg-white p-5">
              <h2 className="mb-4 titre text-xl text-encre">Explorer le texte de loi</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="md:col-span-1">
                  <Sommaire
                    sommaire={sommaire}
                    articleActif={`Article ${articleActifNumero}`}
                    statutParArticle={statutParArticle}
                    onSelect={selectArticle}
                  />
                </div>
                <div className="md:col-span-3">
                  <ArticleTexte article={articleAffiche ?? article} amendement={amendementAffiche} />
                </div>
              </div>
            </div>

            {detailLoading && !enrichi ? (
              <div className="border border-bordure bg-white p-6 text-sm text-gris">
                Chargement de l&apos;historique des amendements…
              </div>
            ) : (
              <>
                <HistoriqueAmendements
                  historique={historique}
                  amendementActifNumero={amendementAffiche?.numero}
                  etapeDate={etape.date}
                  onSelect={setAmendementActif}
                />

                <Influenceurs influenceurs={influenceurs} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
