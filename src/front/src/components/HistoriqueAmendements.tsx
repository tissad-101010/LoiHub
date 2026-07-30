"use client";
import { useState } from "react";
import { Amendement } from "@/lib/types";
import { badgeStatutClass as badgeStatut, statutExplication } from "@/lib/ui";
import Modal from "./Modal";
import ParlementaireAvatar from "./ParlementaireAvatar";

const APERCU_MAX = 6;

export default function HistoriqueAmendements({
  historique,
  total,
  amendementActifNumero,
  etapeDate,
  onSelect,
}: {
  historique: Amendement[];
  total?: number; // nb réel d'amendements sur l'article (historique peut être plafonné)
  amendementActifNumero?: string;
  etapeDate?: string;
  onSelect: (amendement: Amendement) => void;
}) {
  const [voirTous, setVoirTous] = useState(false);
  const apercu = historique.slice(0, APERCU_MAX);
  const totalReel = total ?? historique.length;
  const tronque = totalReel > historique.length; // seuls les plus récents sont chargés

  function selectionner(a: Amendement) {
    onSelect(a);
    setVoirTous(false);
  }

  return (
    <div className="border border-bordure bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="titre text-xl text-encre">Historique des amendements sur cet article</h2>
        {historique.length > 0 && (
          <button onClick={() => setVoirTous(true)} className="text-xs text-bleu">
            Voir tous les amendements ({totalReel.toLocaleString("fr-FR")}) ›
          </button>
        )}
      </div>
      <p className="mb-3 text-xs text-gris">Cliquez sur un amendement pour voir sa différence de version.</p>
      <div className="flex gap-4 overflow-x-auto pb-2">
        <div className="w-40 shrink-0 rounded-lg border border-bordure p-3 text-sm">
          <div className="font-medium text-encre">Texte initial</div>
          <div className="text-xs text-gris">version déposée</div>
        </div>
        {apercu.map((a) => {
          const actif = a.numero === amendementActifNumero;
          const deposeCetteEtape = a.dateDepot === etapeDate;
          return (
            <button
              key={a.numero}
              onClick={() => onSelect(a)}
              className={`w-40 shrink-0 rounded-lg border p-3 text-left text-sm transition-colors ${
                actif ? "border-bleu ring-1 ring-bleu" : "border-bordure hover:border-bleu"
              }`}
            >
              <div className="font-medium text-encre">Amendement n°{a.numero}</div>
              <div className="mt-2 flex items-center gap-2">
                <ParlementaireAvatar depute={a.auteur} size="sm" />
                <div className="min-w-0">
                  <div className="truncate text-xs text-encre">{a.auteur.nom}</div>
                  <div className="truncate text-xs text-gris">
                    {[a.auteur.groupe, a.auteur.id !== "?" ? a.auteur.id : null].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
              <span title={statutExplication[a.statut]} className={`mt-2 inline-block cursor-help rounded px-1.5 py-0.5 text-xs font-medium ${badgeStatut[a.statut]}`}>

                {a.statut}
              </span>
              <div className="mt-1 text-xs text-gris">{a.dateAdoption ?? a.dateDepot}</div>
              {deposeCetteEtape && (
                <div className="mt-1 text-xs font-medium text-bleu">Déposé lors de cette étape</div>
              )}
            </button>
          );
        })}
        <div className="w-40 shrink-0 rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
          <div className="font-medium text-green-700">Version finale</div>
          <div className="text-xs text-green-600">après amendements</div>
        </div>
      </div>

      <Modal open={voirTous} onClose={() => setVoirTous(false)}>
        <h2 className="mb-1 titre text-xl text-encre">Amendements de cet article ({totalReel.toLocaleString("fr-FR")})</h2>
        {tronque && (
          <p className="mb-4 text-xs text-gris">
            Affichage des {historique.length.toLocaleString("fr-FR")} amendements les plus récents (sur{" "}
            {totalReel.toLocaleString("fr-FR")}).
          </p>
        )}
        <div className="space-y-2">
          {historique.map((a) => (
            <button
              key={a.numero}
              onClick={() => selectionner(a)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors ${
                a.numero === amendementActifNumero ? "border-bleu ring-1 ring-bleu" : "border-bordure hover:border-bleu"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <ParlementaireAvatar depute={a.auteur} />
                <div className="min-w-0">
                <div className="font-medium text-encre">
                  Amendement n°{a.numero} — {a.auteur.nom}{" "}
                  <span className="text-gris">
                    {[a.auteur.groupe, a.auteur.id !== "?" ? a.auteur.id : null].filter(Boolean).join(" · ")}
                  </span>
                </div>
                <div className="text-xs text-gris">
                  Déposé le {a.dateDepot}
                  {a.dateAdoption && ` · Adopté le ${a.dateAdoption}`}
                </div>
                </div>
              </div>
              <span title={statutExplication[a.statut]} className={`shrink-0 cursor-help rounded px-2 py-0.5 text-xs font-medium ${badgeStatut[a.statut]}`}>
                {a.statut}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
