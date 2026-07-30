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
  // Aperçu : les amendements ADOPTÉS d'abord (ce sont les « commits » qui ont
  // réellement modifié le texte), complétés par les autres — ordre chronologique
  // préservé. Sans cela, un article très amendé n'affichait souvent que des rejets.
  const apercu = (() => {
    const adoptes = historique.filter((a) => a.statut === "Adopté").slice(0, APERCU_MAX - 2);
    const pris = new Set(adoptes.map((a) => a.numero));
    const complement = historique.filter((a) => !pris.has(a.numero)).slice(0, APERCU_MAX - adoptes.length);
    const ordre = new Map(historique.map((a, i) => [a.numero, i]));
    return [...adoptes, ...complement].sort((x, y) => (ordre.get(x.numero) ?? 0) - (ordre.get(y.numero) ?? 0));
  })();
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
      <p className="mb-1 text-xs text-gris">
        Comme un historique git : le <span className="font-medium text-bleu">fil bleu</span> est
        le texte de la loi. Un amendement <span className="font-medium text-green-700">adopté</span>
        {" "}rejoint le fil (il modifie le texte) ; un amendement{" "}
        <span className="font-medium text-red-600">écarté</span>
        {" "}reste en dérivation. Cliquez une carte pour voir ce qu&apos;elle change.
      </p>

      {(() => {
        // ---- graphe façon commits : géométrie alignée sur les cartes ----
        const CARTE = 160; // w-40
        const GAP = 16; // gap-4
        const PAS = CARTE + GAP;
        const items = apercu.length + 2; // texte initial + amendements + version finale
        const largeur = items * PAS - GAP;
        const centre = (i: number) => i * PAS + CARTE / 2;
        const Y_FIL = 14; // le « main » : fil du texte
        const Y_BRANCHE = 40; // branches des amendements non retenus
        const H = 52;
        const adopte = (s: string) => s === "Adopté";

        return (
          <div className="overflow-x-auto pb-2">
            <div style={{ width: largeur }} className="min-w-full">
              {/* le graphe */}
              <svg width={largeur} height={H} className="block" aria-hidden>
                {/* fil principal du texte */}
                <line x1={centre(0)} y1={Y_FIL} x2={centre(items - 1)} y2={Y_FIL} stroke="var(--color-bleu)" strokeWidth="2.5" />
                {apercu.map((a, i) => {
                  const cx = centre(i + 1);
                  if (adopte(a.statut)) {
                    // commit sur le fil : l'amendement modifie le texte
                    return (
                      <g key={a.numero}>
                        <circle cx={cx} cy={Y_FIL} r="7.5" fill="#22c55e" stroke="#fff" strokeWidth="2" />
                        <path d={`M ${cx - 3.5} ${Y_FIL} l 2.5 2.5 l 4.5 -5`} stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </g>
                    );
                  }
                  // branche qui dérive du fil et s'arrête : proposé mais non retenu
                  const rejete = a.statut === "Rejeté";
                  const c = rejete ? "#ef4444" : "#9ca3af";
                  return (
                    <g key={a.numero}>
                      <path
                        d={`M ${cx - PAS / 2} ${Y_FIL} C ${cx - PAS / 5} ${Y_FIL}, ${cx - PAS / 4} ${Y_BRANCHE}, ${cx} ${Y_BRANCHE}`}
                        stroke={c}
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={rejete ? undefined : "4 3"}
                      />
                      <circle cx={cx} cy={Y_BRANCHE} r="6.5" fill="#fff" stroke={c} strokeWidth="2" />
                      {/* croix : la branche s'arrête là */}
                      <path d={`M ${cx - 2.5} ${Y_BRANCHE - 2.5} l 5 5 M ${cx + 2.5} ${Y_BRANCHE - 2.5} l -5 5`} stroke={c} strokeWidth="1.8" strokeLinecap="round" />
                    </g>
                  );
                })}
                {/* nœuds de départ et d'arrivée du fil */}
                <circle cx={centre(0)} cy={Y_FIL} r="7" fill="#fff" stroke="var(--color-bleu)" strokeWidth="2.5" />
                <circle cx={centre(items - 1)} cy={Y_FIL} r="7.5" fill="var(--color-bleu)" stroke="#fff" strokeWidth="2" />
                <path d={`M ${centre(items - 1) - 3} ${Y_FIL} h 6`} stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>

              {/* les cartes, alignées sous leur nœud */}
              <div className="flex gap-4">
                <div className="flex w-40 shrink-0 flex-col rounded-lg border border-dashed border-bordure bg-fond p-3 text-sm">
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
                      className={`w-40 shrink-0 rounded-lg border bg-white p-3 text-left text-sm shadow-sm transition ${
                        actif
                          ? "border-bleu ring-1 ring-bleu"
                          : "border-bordure hover:-translate-y-0.5 hover:border-bleu hover:shadow-md"
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
                <div className="flex w-40 shrink-0 flex-col rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
                  <div className="font-medium text-green-700">Version finale</div>
                  <div className="text-xs text-green-600">après amendements</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
