"use client";
import { useState } from "react";
import { Article } from "@/lib/types";
import Modal from "./Modal";
import ParlementaireAvatar from "./ParlementaireAvatar";

const APERCU_MAX = 4;

function LigneInfluenceur({ i, rang }: { i: Article["influenceurs"][number]; rang: number }) {
  return (
    <li className="flex items-center gap-3">
      <span className="w-4 text-sm text-gray-400">{rang}</span>
      <ParlementaireAvatar depute={i.depute} />
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-900">{i.depute.nom}</div>
        <div className="text-xs text-gray-500">
          {[i.depute.groupe, i.depute.id !== "?" ? i.depute.id : null].filter(Boolean).join(" · ")}
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100">
          <div className="h-1.5 rounded-full" style={{ width: `${i.part}%`, backgroundColor: i.depute.couleur }} />
        </div>
      </div>
      <span className="text-sm font-medium text-slate-900">{i.part}%</span>
    </li>
  );
}

export default function Influenceurs({ influenceurs }: { influenceurs: Article["influenceurs"] }) {
  const [voirTout, setVoirTout] = useState(false);
  const apercu = influenceurs.slice(0, APERCU_MAX);
  const reste = influenceurs.length - apercu.length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Qui a influencé cet article ?</h2>
        {reste > 0 && (
          <button onClick={() => setVoirTout(true)} className="text-xs text-blue-600">
            Voir tout
          </button>
        )}
      </div>
      <ol className="space-y-3">
        {apercu.map((i, idx) => (
          <LigneInfluenceur key={i.depute.id} i={i} rang={idx + 1} />
        ))}
      </ol>
      {reste > 0 && <div className="mt-2 text-xs text-gray-400">+{reste} autres députés</div>}

      <Modal open={voirTout} onClose={() => setVoirTout(false)}>
        <h2 className="mb-4 font-semibold text-slate-900">Tous les contributeurs de cet article</h2>
        <ol className="space-y-3">
          {influenceurs.map((i, idx) => (
            <LigneInfluenceur key={i.depute.id} i={i} rang={idx + 1} />
          ))}
        </ol>
      </Modal>
    </div>
  );
}
