"use client";
import { useState } from "react";
import Link from "next/link";
import type { Scrutin } from "@/lib/types";
import BarreVote from "./BarreVote";

const APERCU = 5;

export default function ScrutinsLoi({
  scrutins,
  total,
  dossierUid,
}: {
  scrutins: Scrutin[];
  total?: number;
  dossierUid?: string;
}) {
  const [tout, setTout] = useState(false);
  if (!scrutins.length) return null;
  const visibles = tout ? scrutins : scrutins.slice(0, APERCU);
  const totalReel = total ?? scrutins.length;
  const tronque = totalReel > scrutins.length; // seuls les plus récents sont chargés

  return (
    <div className="border border-bordure bg-white p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="titre text-xl text-encre">Scrutins publics</h2>
        <span className="text-xs text-gris">{totalReel.toLocaleString("fr-FR")}</span>
      </div>
      <p className="mb-4 text-xs text-gris">
        Votes solennels et scrutins publics rattachés à ce texte —{" "}
        <span className="text-green-600">pour</span> · <span className="text-red-600">contre</span> ·{" "}
        <span className="text-gris">abstention</span>.
        {tronque && (
          <> Affichage des {scrutins.length} plus récents (sur {totalReel.toLocaleString("fr-FR")}).</>
        )}
      </p>

      <ul className="space-y-3">
        {visibles.map((s) => (
          <li key={s.uid} className="border border-bordure p-3 transition hover:border-bleu">
            <div className="mb-1.5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                {/* la fiche du scrutin donne le détail nominatif par groupe */}
                <Link href={`/vote/${encodeURIComponent(s.uid)}`} className="text-sm text-encre hover:text-bleu hover:underline">
                  {s.titre}
                </Link>
                <div className="mt-0.5 text-xs text-gris">
                  {s.date}
                  {s.numero && ` · scrutin n°${s.numero}`}
                </div>
              </div>
              <span
                title={s.sortLibelle}
                className={`shrink-0 cursor-help rounded-full px-2 py-0.5 text-xs font-medium ${
                  s.adopte ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {s.adopte ? "Adopté" : "Rejeté"}
              </span>
            </div>
            <BarreVote scrutin={s} legende />
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        {scrutins.length > APERCU && (
          <button onClick={() => setTout((v) => !v)} className="text-xs text-bleu">
            {tout ? "Voir moins" : tronque ? `Voir les ${scrutins.length} scrutins les plus récents` : `Voir les ${scrutins.length} scrutins`}
          </button>
        )}
        {dossierUid && tronque && (
          <Link href={`/votes?dossier=${encodeURIComponent(dossierUid)}`} className="text-xs font-medium text-bleu hover:underline">
            Parcourir les {totalReel.toLocaleString("fr-FR")} scrutins de ce texte →
          </Link>
        )}
      </div>
    </div>
  );
}
