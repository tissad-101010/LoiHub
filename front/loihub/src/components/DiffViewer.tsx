"use client";
import { useState } from "react";
import { DiffLigne, Amendement } from "@/lib/types";

interface Segment {
  numero: number;
  avant?: DiffLigne;
  apres?: DiffLigne;
}

function fusionner(avant: DiffLigne[], apres: DiffLigne[]): Segment[] {
  const numeros = Array.from(new Set([...avant.map((l) => l.numero), ...apres.map((l) => l.numero)])).sort(
    (a, b) => a - b
  );
  return numeros.map((numero) => ({
    numero,
    avant: avant.find((l) => l.numero === numero),
    apres: apres.find((l) => l.numero === numero),
  }));
}

export default function DiffViewer({ diff, amendement }: { diff?: { avant: DiffLigne[]; apres: DiffLigne[] }; amendement?: Amendement }) {
  const [voirPlus, setVoirPlus] = useState(false);
  const segments = diff ? fusionner(diff.avant, diff.apres) : [];

  if (!diff) {
    if (!amendement) return null;
    return (
      <div className="mt-4 border-t border-gray-100 pt-4">
        <h3 className="mb-1 text-sm font-medium text-slate-500">Différence avec la version précédente</h3>
        <p className="text-sm text-gray-500">
          Amendement n°{amendement.numero} ({amendement.statut.toLowerCase()}) — aucune modification appliquée au texte.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <h3 className="mb-2 text-sm font-medium text-slate-500">Différence avec la version précédente</h3>

      <p className="rounded-lg bg-gray-50 p-4 text-sm leading-7 text-slate-800">
        {segments.map((s) => {
          const memeTexte = s.avant && s.apres && s.avant.texte === s.apres.texte;

          if (memeTexte || (s.avant?.type === "inchange" && s.apres?.type === "inchange")) {
            return <span key={s.numero}>{s.apres?.texte ?? s.avant?.texte} </span>;
          }

          return (
            <span key={s.numero}>
              {s.avant && s.avant.type !== "inchange" && (
                <span className="rounded bg-red-100 text-red-700 line-through decoration-red-400">
                  {s.avant.texte}
                </span>
              )}
              {s.avant && s.avant.type !== "inchange" && s.apres && s.apres.type !== "inchange" && " "}
              {s.apres && s.apres.type !== "inchange" && (
                <span className="rounded bg-green-100 font-medium text-green-800">{s.apres.texte}</span>
              )}{" "}
            </span>
          );
        })}
      </p>

      <button onClick={() => setVoirPlus((v) => !v)} className="mt-2 text-xs text-blue-600">
        {voirPlus ? "Voir moins" : "Voir plus, infos"}
      </button>

      {voirPlus && amendement && (
        <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-500">
          <div>Amendement n°{amendement.numero}</div>
          <div>Statut : {amendement.statut}</div>
          <div>Auteur : {amendement.auteur.nom}</div>
          <div>Groupe : {amendement.auteur.groupe}</div>
          <div>Déposé le : {amendement.dateDepot}</div>
          {amendement.dateAdoption && <div>Adopté le : {amendement.dateAdoption}</div>}
        </div>
      )}
    </div>
  );
}
