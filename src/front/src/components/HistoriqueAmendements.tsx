"use client";
import { useState } from "react";
import { Amendement } from "@/lib/types";
import { badgeStatutClass as badgeStatut } from "@/lib/ui";
import Modal from "./Modal";
import ParlementaireAvatar from "./ParlementaireAvatar";

const APERCU_MAX = 6;

export default function HistoriqueAmendements({
  historique,
  amendementActifNumero,
  etapeDate,
  onSelect,
}: {
  historique: Amendement[];
  amendementActifNumero?: string;
  etapeDate?: string;
  onSelect: (amendement: Amendement) => void;
}) {
  const [voirTous, setVoirTous] = useState(false);
  const apercu = historique.slice(0, APERCU_MAX);

  function selectionner(a: Amendement) {
    onSelect(a);
    setVoirTous(false);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Historique des amendements sur cet article</h2>
        {historique.length > 0 && (
          <button onClick={() => setVoirTous(true)} className="text-xs text-blue-600">
            Voir tous les amendements ({historique.length}) ›
          </button>
        )}
      </div>
      <p className="mb-3 text-xs text-gray-500">Cliquez sur un amendement pour voir sa différence de version.</p>
      <div className="flex gap-4 overflow-x-auto pb-2">
        <div className="w-40 shrink-0 rounded-lg border border-gray-200 p-3 text-sm">
          <div className="font-medium text-slate-900">Texte initial</div>
          <div className="text-xs text-gray-500">du gouvernement</div>
          <div className="mt-2 text-xs text-gray-400">v1.0</div>
        </div>
        {apercu.map((a) => {
          const actif = a.numero === amendementActifNumero;
          const deposeCetteEtape = a.dateDepot === etapeDate;
          return (
            <button
              key={a.numero}
              onClick={() => onSelect(a)}
              className={`w-40 shrink-0 rounded-lg border p-3 text-left text-sm transition-colors ${
                actif ? "border-blue-600 ring-1 ring-blue-600" : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="font-medium text-slate-900">Amendement n°{a.numero}</div>
              <div className="mt-2 flex items-center gap-2">
                <ParlementaireAvatar depute={a.auteur} size="sm" />
                <div className="min-w-0">
                  <div className="truncate text-xs text-gray-700">{a.auteur.nom}</div>
                  <div className="truncate text-xs text-gray-500">
                    {[a.auteur.groupe, a.auteur.id !== "?" ? a.auteur.id : null].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
              <span className={`mt-2 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${badgeStatut[a.statut]}`}>
                {a.statut}
              </span>
              <div className="mt-1 text-xs text-gray-400">{a.dateAdoption ?? a.dateDepot}</div>
              {deposeCetteEtape && (
                <div className="mt-1 text-xs font-medium text-blue-600">Déposé lors de cette étape</div>
              )}
            </button>
          );
        })}
        <div className="w-40 shrink-0 rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
          <div className="font-medium text-green-700">Version finale</div>
          <div className="text-xs text-green-600">v3.2</div>
        </div>
      </div>

      <Modal open={voirTous} onClose={() => setVoirTous(false)}>
        <h2 className="mb-4 font-semibold text-slate-900">Tous les amendements de cet article ({historique.length})</h2>
        <div className="space-y-2">
          {historique.map((a) => (
            <button
              key={a.numero}
              onClick={() => selectionner(a)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors ${
                a.numero === amendementActifNumero ? "border-blue-600 ring-1 ring-blue-600" : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <ParlementaireAvatar depute={a.auteur} />
                <div className="min-w-0">
                <div className="font-medium text-slate-900">
                  Amendement n°{a.numero} — {a.auteur.nom}{" "}
                  <span className="text-gray-400">
                    {[a.auteur.groupe, a.auteur.id !== "?" ? a.auteur.id : null].filter(Boolean).join(" · ")}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Déposé le {a.dateDepot}
                  {a.dateAdoption && ` · Adopté le ${a.dateAdoption}`}
                </div>
                </div>
              </div>
              <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${badgeStatut[a.statut]}`}>
                {a.statut}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
