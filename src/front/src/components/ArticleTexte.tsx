"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Amendement, Article, BlameAlinea } from "@/lib/types";
import { alineasVises, libelleCourtVersion } from "@/lib/blame";
import { badgeStatutClass } from "@/lib/ui";
import ParlementaireAvatar from "./ParlementaireAvatar";
import ResumeIABouton from "./ResumeIABouton";

// `article.texte` vaut ce placeholder quand l'open data AN ne fournit pas le
// texte articulé (cf. lib/data.ts) : dans ce cas, rien à résumer.
const TEXTE_INDISPONIBLE = "Le texte de cet article n'est pas encore disponible";
const texteResumable = (t: string) => t.trim().length >= 80 && !t.startsWith(TEXTE_INDISPONIBLE);

// Au-delà de ce nombre d'alinéas, l'article est long (ex. article 2 d'une loi de
// finances) : on le replie par défaut pour ne pas noyer le lecteur.
const APERCU_ALINEAS = 12;

// Gouttière de « blame » : qui est à l'origine de cet alinéa. Un amendement nommé
// quand la correspondance est certaine, sinon la version du texte qui l'a
// introduit (fait exact) — voir lib/blame.ts.
function ChipBlame({ b }: { b?: BlameAlinea }) {
  if (!b) return <span className="w-24 shrink-0" />;

  if (b.amendement) {
    const a = b.amendement;
    const titre = `Alinéa issu de l'amendement n° ${a.numero} de ${a.auteur.nom}${
      a.auteur.groupe ? ` (${a.auteur.groupe})` : ""
    }${a.dateAdoption ? `, adopté le ${a.dateAdoption}` : ""} — ${b.versionLabel}`;
    const contenu = (
      <>
        <ParlementaireAvatar depute={a.auteur} size="sm" />
        <span className="ref-mono truncate text-[10px] text-bleu">n°{a.numero}</span>
      </>
    );
    return a.uid ? (
      <Link
        href={`/amendement/${encodeURIComponent(a.uid)}`}
        title={titre}
        className="flex w-24 shrink-0 items-center gap-1 rounded px-1 py-0.5 hover:bg-bleu-100"
      >
        {contenu}
      </Link>
    ) : (
      <span title={titre} className="flex w-24 shrink-0 items-center gap-1 px-1">
        {contenu}
      </span>
    );
  }

  // Pas d'amendement nommé : on dit d'où vient l'alinéa (fait exact) et pourquoi
  // on ne va pas plus loin. Un silence laisserait croire à un oubli.
  const raison =
    b.motif === "plusieurs-candidats"
      ? ` ${b.candidats} amendements adoptés visent cet alinéa : impossible de trancher lequel l'a écrit.`
      : b.motif === "alinea-non-resolu"
        ? " Cet alinéa est apparu à cette étape sans équivalent dans la version précédente : aucun amendement ne peut lui être rattaché avec certitude."
        : b.motif === "aucun-candidat"
          ? " Aucun amendement adopté de cette étape ne le vise explicitement."
          : "";

  return (
    <span
      title={
        b.origine
          ? `Alinéa présent dès la première version connue — ${b.versionLabel}.`
          : `Alinéa introduit par : ${b.versionLabel}.${raison}`
      }
      className="w-24 shrink-0 cursor-help truncate px-1 text-[10px] text-gris"
    >
      {b.origine ? "texte initial" : libelleCourtVersion(b.versionLabel)}
    </span>
  );
}

export default function ArticleTexte({
  article,
  amendement,
  blame,
}: {
  article: Article;
  amendement?: Amendement;
  blame?: BlameAlinea[];
}) {
  const am = amendement;
  const texte = article.texte;

  // Découpage en alinéas (numérotés, façon lignes de code).
  const alineas = useMemo(() => texte.split(/\n+/).map((l) => l.trim()).filter(Boolean), [texte]);

  // Texte adopté « en séance » : n'affiche que les modifs, avec des marqueurs.
  const marqueurs = alineas.filter((l) => /\(\s*(?:non\s*modifi|supprim)/i.test(l)).length;
  const estTexteSeance = alineas.length > 0 && marqueurs / alineas.length >= 0.34;

  // Alinéas explicitement visés par l'amendement affiché (champ officiel AN).
  const vises = useMemo(() => (am ? alineasVises(am) : new Set<number>()), [am]);

  // `deplie` doit repartir à zéro quand on change d'article ou de version : c'est
  // le `key` posé par LoiPageClient qui remonte le composant, plutôt qu'un effet
  // qui remettrait l'état à false après un premier rendu inutile.
  const [deplie, setDeplie] = useState(false);
  const [montreBlame, setMontreBlame] = useState(true);

  const estLong = alineas.length > APERCU_ALINEAS;
  // Si l'amendement vise un alinéa au-delà de l'aperçu, on déplie pour le montrer.
  const forceDeplie = [...vises].some((n) => n > APERCU_ALINEAS);
  const montreTout = deplie || forceDeplie;
  const visibles = estLong && !montreTout ? alineas.slice(0, APERCU_ALINEAS) : alineas;
  const indisponible = texte.startsWith(TEXTE_INDISPONIBLE);
  // Le blame est calculé sur la version publiée ; il ne s'aligne donc que si le
  // découpage affiché correspond (même nombre d'alinéas).
  const blameAligne = blame && blame.length === alineas.length ? blame : undefined;
  const nbAttribues = blameAligne?.filter((b) => b.amendement).length ?? 0;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h2 className="titre text-xl text-encre">{article.titre}</h2>
        {am && (
          <span className="inline-flex items-center gap-1.5 rounded bg-bleu-100 px-2 py-0.5 text-xs font-medium text-bleu">
            Visé par l&apos;amendement n°{am.numero}
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${badgeStatutClass[am.statut]}`}>
              {am.statut}
            </span>
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

      {am && vises.size > 0 && (
        <p className="mb-3 text-xs text-gris">
          L&apos;amendement n°{am.numero} vise :{" "}
          {[...vises].sort((a, b) => a - b).map((n, i) => (
            <span key={n}>
              {i > 0 && " · "}
              <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">alinéa {n}</span>
            </span>
          ))}
        </p>
      )}

      {/* Résumé IA en tête : saisir l'essentiel en langage clair avant le texte juridique. */}
      {texteResumable(texte) && <ResumeIABouton texte={texte} />}

      {blameAligne && (
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs text-gris">
            {nbAttribues > 0
              ? `${nbAttribues} alinéa${nbAttribues > 1 ? "s" : ""} sur ${alineas.length} attribuable${
                  nbAttribues > 1 ? "s" : ""
                } à un amendement précis ; pour les autres, la version d'origine est indiquée.`
              : "Origine de chaque alinéa : la version du texte qui l'a introduit."}
          </p>
          <button
            type="button"
            onClick={() => setMontreBlame((v) => !v)}
            aria-pressed={montreBlame}
            className="shrink-0 text-xs text-bleu"
          >
            {montreBlame ? "Masquer l'origine des alinéas" : "Afficher l'origine des alinéas"}
          </button>
        </div>
      )}

      {indisponible ? (
        <p className="text-sm leading-relaxed text-gris">{texte}</p>
      ) : (
        <ol className="overflow-hidden rounded-lg border border-bordure">
          {visibles.map((al, i) => {
            const num = i + 1;
            const vise = vises.has(num);
            return (
              <li
                key={i}
                className={`flex items-start gap-3 px-2 py-1 ${vise ? "bg-amber-50" : i % 2 ? "bg-fond/40" : ""}`}
              >
                <span className="w-7 shrink-0 select-none text-right font-mono text-[11px] leading-6 text-gray-300">
                  {num}
                </span>
                <span className="flex-1 text-sm leading-6 text-encre">{al}</span>
                {montreBlame && blameAligne && (
                  <span className="flex shrink-0 items-center pt-0.5">
                    <ChipBlame b={blameAligne[i]} />
                  </span>
                )}
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
    </div>
  );
}
