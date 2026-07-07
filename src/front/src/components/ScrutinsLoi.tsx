"use client";
import { useState } from "react";
import type { Scrutin } from "@/lib/types";

const APERCU = 5;

function BarreVote({ s }: { s: Scrutin }) {
  const total = s.pour + s.contre + s.abstention || 1;
  const seg = (n: number) => `${(n / total) * 100}%`;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-fond-alt">
      <div style={{ width: seg(s.pour) }} className="bg-green-500" title={`Pour : ${s.pour}`} />
      <div style={{ width: seg(s.contre) }} className="bg-red-500" title={`Contre : ${s.contre}`} />
      <div style={{ width: seg(s.abstention) }} className="bg-gray-400" title={`Abstention : ${s.abstention}`} />
    </div>
  );
}

export default function ScrutinsLoi({ scrutins }: { scrutins: Scrutin[] }) {
  const [tout, setTout] = useState(false);
  if (!scrutins.length) return null;
  const visibles = tout ? scrutins : scrutins.slice(0, APERCU);

  return (
    <div className="border border-bordure bg-white p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="titre text-xl text-encre">Scrutins publics</h2>
        <span className="text-xs text-gris">{scrutins.length}</span>
      </div>
      <p className="mb-4 text-xs text-gris">
        Votes solennels et scrutins publics rattachés à ce texte —{" "}
        <span className="text-green-600">pour</span> · <span className="text-red-600">contre</span> ·{" "}
        <span className="text-gris">abstention</span>.
      </p>

      <ul className="space-y-3">
        {visibles.map((s) => (
          <li key={s.uid} className="border border-bordure p-3">
            <div className="mb-1.5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm text-encre">{s.titre}</div>
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
            <BarreVote s={s} />
            <div className="mt-1.5 flex gap-4 text-xs text-gris">
              <span><span className="font-medium text-green-700">{s.pour}</span> pour</span>
              <span><span className="font-medium text-red-700">{s.contre}</span> contre</span>
              <span><span className="font-medium text-gris">{s.abstention}</span> abstention</span>
            </div>
          </li>
        ))}
      </ul>

      {scrutins.length > APERCU && (
        <button onClick={() => setTout((v) => !v)} className="mt-3 text-xs text-bleu">
          {tout ? "Voir moins" : `Voir les ${scrutins.length} scrutins`}
        </button>
      )}
    </div>
  );
}
