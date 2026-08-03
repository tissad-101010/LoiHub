"use client";
import { useEffect, useMemo, useState } from "react";
import { calculeBlame } from "@/lib/blame";
import { texteEstPartiel } from "@/lib/ui";
import SiteHeader from "@/components/SiteHeader";
import Fil from "@/components/Fil";
import LoiHeader from "@/components/LoiHeader";
import GuideLecture from "@/components/GuideLecture";
import QuestionLoi from "@/components/QuestionLoi";
import ParcoursVertical from "@/components/ParcoursVertical";
import StatsCards from "@/components/StatsCards";
import RepartitionGroupes from "@/components/RepartitionGroupes";
import ConseilConstit from "@/components/ConseilConstit";
import ScrutinsLoi from "@/components/ScrutinsLoi";
import Sommaire from "@/components/Sommaire";
import ArticleTexte from "@/components/ArticleTexte";
import DiffViewer from "@/components/DiffViewer";
import OrigineModification from "@/components/OrigineModification";
import EvolutionTexte from "@/components/EvolutionTexte";
import HistoriqueAmendements from "@/components/HistoriqueAmendements";
import Influenceurs from "@/components/Influenceurs";
import TexteLoiComplet from "@/components/TexteLoiComplet";
import { Amendement, ArticleDetail, ProjetLoi } from "@/lib/types";

export default function LoiPageClient({ projet }: { projet: ProjetLoi }) {
  const loi = {
    numero: projet.numeroAffiche ?? projet.numero,
    type: projet.type,
    chambre: projet.chambreOrigine,
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
  const articles = projet.articles;

  // L'article ouvert par défaut arrive AVEC la page (détail inclus) : le texte,
  // son origine et son évolution sont lisibles sans interaction préalable.
  const [articleActifNumero, setArticleActifNumero] = useState(
    projet.articleDefaut ?? articles[0]?.numero ?? ""
  );
  const [amendementActif, setAmendementActif] = useState<Amendement | null>(null);
  // Étape du parcours : filtre optionnel « lire le texte tel qu'il était à cette
  // date ». `null` = dernière version publiée (l'état par défaut, le plus utile).
  const [etapeActive, setEtapeActive] = useState<number | null>(null);

  const etape = etapeActive !== null ? parcours[etapeActive] : null;
  const article = articles.find((a) => a.numero === articleActifNumero);

  // Détail par article (historique, influenceurs, versions), mis en cache par
  // numéro. Celui de l'article par défaut est déjà là — pas de requête au
  // chargement ; les suivants arrivent via GET /api/article.
  const [details, setDetails] = useState<Record<string, ArticleDetail>>(() =>
    projet.articleDefaut && projet.detailDefaut
      ? { [projet.articleDefaut]: projet.detailDefaut }
      : {}
  );
  const enrichi = article ? details[article.numero] : undefined;

  useEffect(() => {
    if (!articleActifNumero) return;
    if (details[articleActifNumero]) return; // déjà en cache
    let annule = false;
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
            [articleActifNumero]: { historique: [], totalHistorique: 0, influenceurs: [], versionsTexte: [] },
          }));
      });
    return () => {
      annule = true;
    };
  }, [articleActifNumero, details, projet.numero]);

  // Le chargement se déduit de l'absence de détail en cache : pas d'état séparé à
  // synchroniser (et pas de setState dans l'effet). Un échec de requête écrit un
  // détail vide, donc l'attente ne peut pas rester bloquée.
  const chargement = !enrichi;

  // Mémoïsés : ces tableaux servent de dépendances aux useMemo ci-dessous, un
  // nouveau littéral à chaque rendu les ferait tous recalculer.
  const versions = useMemo(() => enrichi?.versionsTexte ?? [], [enrichi]);
  const historique = useMemo(() => enrichi?.historique ?? [], [enrichi]);
  const totalHistorique = enrichi?.totalHistorique ?? historique.length;
  const influenceurs = enrichi?.influenceurs ?? [];
  const amendementAffiche = amendementActif ?? article?.amendementActuel;

  // Version du texte à afficher : la dernière publiée par défaut, ou la dernière
  // antérieure à l'étape sélectionnée quand l'utilisateur remonte dans le temps.
  const indexVersion = useMemo(() => {
    if (!versions.length) return -1;
    if (!etape?.dateIso) return versions.length - 1;
    let idx = -1;
    for (let i = 0; i < versions.length; i++) {
      if (versions[i].dateIso && versions[i].dateIso <= etape.dateIso) idx = i;
    }
    return idx; // -1 : l'article n'existait pas encore à cette date
  }, [versions, etape]);

  const articleAffiche = useMemo(() => {
    if (!article) return article;
    const v = indexVersion >= 0 ? versions[indexVersion] : undefined;
    if (!v) return article;
    return { ...article, texte: v.alineas.join("\n\n") };
  }, [article, versions, indexVersion]);

  // Blame par alinéa de la version affichée (voir lib/blame.ts pour les limites).
  const blame = useMemo(() => {
    if (indexVersion < 0 || !versions.length) return undefined;
    if (texteEstPartiel(versions[indexVersion].alineas)) return undefined; // texte de séance : rien à attribuer
    return calculeBlame({ versions, historique, indexAffiche: indexVersion });
  }, [versions, historique, indexVersion]);

  function selectEtape(index: number) {
    setEtapeActive(index === -1 ? null : index);
    setAmendementActif(null);
  }
  function selectArticle(numero: string) {
    setArticleActifNumero(numero);
    setAmendementActif(null);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-5 p-6">
        <Fil items={[{ label: "Accueil", href: "/" }, { label: "Lois", href: "/lois" }, { label: loi.titre }]} />
        <LoiHeader loi={loi} />
        <StatsCards stats={projet.stats} />
        <GuideLecture />

        {/* Deux colonnes (desktop) : le contenu à gauche, le parcours en timeline
            verticale COLLANTE à droite — on change d'étape sans remonter la page.
            Sur mobile, le parcours vient juste après le guide (ordre du DOM). */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <aside className="space-y-5 self-start lg:sticky lg:top-20 lg:order-2">
            <ParcoursVertical etapes={parcours} etapeActive={etapeActive} onSelect={selectEtape} />
            {projet.conseilConstit && <ConseilConstit cc={projet.conseilConstit} />}
          </aside>

          <div className="min-w-0 space-y-5 lg:order-1">
            {articles.length === 0 ? (
              <section className="border border-bordure bg-white p-6">
                <h2 className="titre text-xl text-encre">Texte de la loi</h2>
                <p className="mt-2 text-sm text-gris">
                  Aucun amendement n&apos;a été déposé sur ce texte : il n&apos;y a pas encore
                  d&apos;article à explorer ici. Le texte intégral est consultable sur le dossier
                  officiel de l&apos;Assemblée nationale (lien ci-dessus).
                </p>
              </section>
            ) : (
              <>
                {etape && (
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-bleu-100 px-4 py-2 text-sm text-bleu">
                    <span>
                      Texte affiché à l&apos;étape <span className="font-medium">{etape.label}</span>
                      {etape.date && <> — {etape.date}</>}
                      {indexVersion < 0 && " (aucune version publiée à cette date)"}
                    </span>
                    <button type="button" onClick={() => selectEtape(-1)} className="shrink-0 underline">
                      Revenir à la dernière version
                    </button>
                  </div>
                )}

                {/* Sommaire + texte de l'article : le cœur de la page, visible d'emblée. */}
                <section className="border border-bordure bg-white p-5">
                  <h2 className="mb-4 titre text-xl text-encre">Explorer le texte de loi</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-[13rem_minmax(0,1fr)]">
                    <div className="md:border-r md:border-bordure md:pr-4">
                      <Sommaire
                        articles={articles}
                        articleActif={articleActifNumero}
                        onSelect={selectArticle}
                      />
                    </div>
                    <div className="min-w-0">
                      {article && (
                        <ArticleTexte
                          // remonter le composant remet ses replis à zéro quand
                          // on change d'article ou de version affichée
                          key={`${article.numero}-${indexVersion}`}
                          article={articleAffiche ?? article}
                          amendement={amendementAffiche}
                          blame={blame}
                        />
                      )}
                    </div>
                  </div>
                </section>

                {chargement ? (
                  <p className="border border-bordure bg-white p-6 text-sm text-gris">
                    Chargement de l&apos;historique de l&apos;article…
                  </p>
                ) : (
                  <>
                    <OrigineModification amendement={amendementAffiche} />
                    {/* Le dispositif (prose officielle) vient APRÈS l'origine :
                        on répond d'abord « qui, quand, adopté ? », ensuite « quoi ». */}
                    {amendementAffiche && (
                      <section className="border border-bordure bg-white px-5 pb-5">
                        <DiffViewer amendement={amendementAffiche} />
                      </section>
                    )}
                    <EvolutionTexte versions={versions} />
                    <HistoriqueAmendements
                      historique={historique}
                      total={totalHistorique}
                      amendementActifNumero={amendementAffiche?.numero}
                      etapeDate={etape?.date}
                      onSelect={setAmendementActif}
                    />
                    <Influenceurs
                      influenceurs={influenceurs}
                      adoptesSansAuteur={enrichi?.adoptesSansAuteur}
                    />
                  </>
                )}

                <TexteLoiComplet titreLoi={loi.titre} articles={articles} />
              </>
            )}

            {projet.repartitionGroupes.length > 0 && (
              <RepartitionGroupes groupes={projet.repartitionGroupes} />
            )}
            {projet.scrutins.length > 0 && (
              <ScrutinsLoi
                scrutins={projet.scrutins}
                total={projet.scrutinsTotal}
                dossierUid={projet.numero}
              />
            )}
            <QuestionLoi dossierUid={projet.numero} />
          </div>
        </div>
      </main>
    </div>
  );
}
