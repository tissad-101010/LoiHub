"use client";
import { useState } from "react";
import Link from "next/link";
import { Amendement } from "@/lib/types";
import { badgeStatutClass } from "@/lib/ui";

// Bloc « ce que prévoit UN amendement ».
//
// On N'INVENTE PAS de diff ligne-à-ligne à partir de la prose de l'amendement :
// un amendement dit p.ex. « à l'alinéa 8, substituer aux mots "en 2026" les mots
// "du 1er août 2026…" » — en extraire "en 2026 → du 1er août…" hors contexte est
// trompeur (ces fragments sont introuvables tels quels dans le texte affiché).
// On affiche donc l'instruction officielle telle quelle, en mettant simplement
// en évidence les termes entre guillemets. Le vrai diff (texte officiel entre
// deux versions) est géré séparément par TexteDiff (« Évolution du texte »).

// Met en valeur les termes cités « … » sans rien affirmer sur leur sens.
function renderDispositif(texte: string) {
  return texte.split(/(«[^»]*»)/g).map((part, i) =>
    /^«[^»]*»$/.test(part) ? (
      <mark key={i} className="rounded bg-bleu-100 px-1 font-medium text-encre">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function DiffViewer({ amendement }: { amendement?: Amendement }) {
  const [voirPlus, setVoirPlus] = useState(false);
  if (!amendement) return null;

  return (
    <div className="mt-4 border-t border-bordure pt-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium text-gris">
          Ce que prévoit l&apos;amendement n°{amendement.numero}
        </h3>
        <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${badgeStatutClass[amendement.statut]}`}>
          {amendement.statut}
        </span>
      </div>

      {amendement.dispositif ? (
        <p className="whitespace-pre-line rounded-lg bg-fond p-4 text-sm leading-relaxed text-encre">
          {renderDispositif(amendement.dispositif)}
        </p>
      ) : (
        <p className="text-sm text-gris">
          Le dispositif de cet amendement ({amendement.statut.toLowerCase()}) n&apos;est pas disponible dans les
          données de l&apos;Assemblée nationale.
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button onClick={() => setVoirPlus((v) => !v)} className="text-xs text-bleu">
          {voirPlus ? "Masquer les détails" : "Détails de l'amendement"}
        </button>
        {amendement.uid && (
          <Link href={`/amendement/${encodeURIComponent(amendement.uid)}`} className="text-xs font-medium text-bleu hover:underline">
            Voir la fiche de l&apos;amendement →
          </Link>
        )}
      </div>

      {voirPlus && (
        <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-gris sm:grid-cols-2">
          <div>Amendement n°{amendement.numero}</div>
          <div>Statut : {amendement.statut}</div>
          <div>Auteur : {amendement.auteur.nom}</div>
          <div>Groupe : {amendement.auteur.groupe || "—"}</div>
          <div>Déposé le : {amendement.dateDepot || "—"}</div>
          {amendement.dateAdoption && <div>Adopté le : {amendement.dateAdoption}</div>}
        </div>
      )}
    </div>
  );
}
