"use client";
import { useState } from "react";
import Link from "next/link";
import { Article } from "@/lib/types";
import Modal from "./Modal";
import ParlementaireAvatar from "./ParlementaireAvatar";

const APERCU_MAX = 4;

// Seuls les députés AN (réf. "PA…") ont une fiche /depute/[id] consultable.
const aUneFiche = (id: string) => /^PA\d+$/.test(id);

function LigneInfluenceur({ i, rang }: { i: Article["influenceurs"][number]; rang: number }) {
  const lienFiche = aUneFiche(i.depute.id);
  const identite = (
    <>
      <ParlementaireAvatar depute={i.depute} />
      <div className="flex-1">
        <div className={`text-sm font-medium text-encre ${lienFiche ? "group-hover:underline" : ""}`}>
          {i.depute.nom}
        </div>
        <div className="text-xs text-gris">
          {[i.depute.groupe, i.depute.id !== "?" ? i.depute.id : null].filter(Boolean).join(" · ")}
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-fond-alt">
          <div className="h-1.5 rounded-full" style={{ width: `${i.part}%`, backgroundColor: i.depute.couleur }} />
        </div>
      </div>
    </>
  );
  return (
    <li className="flex items-center gap-3">
      <span className="w-4 text-sm text-gris">{rang}</span>
      {lienFiche ? (
        <Link
          href={`/depute/${encodeURIComponent(i.depute.id)}`}
          className="group flex flex-1 items-center gap-3"
        >
          {identite}
        </Link>
      ) : (
        <div className="flex flex-1 items-center gap-3">{identite}</div>
      )}
      <span className="text-sm font-medium text-encre">{i.part}%</span>
    </li>
  );
}

export default function Influenceurs({ influenceurs }: { influenceurs: Article["influenceurs"] }) {
  const [voirTout, setVoirTout] = useState(false);
  const apercu = influenceurs.slice(0, APERCU_MAX);
  const reste = influenceurs.length - apercu.length;

  return (
    <div className="border border-bordure bg-white p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="titre text-xl text-encre">Qui a influencé cet article ?</h2>
        {reste > 0 && (
          <button onClick={() => setVoirTout(true)} className="text-xs text-bleu">
            Voir tout
          </button>
        )}
      </div>
      <p className="mb-3 text-xs text-gris">
        Part des amendements <span className="font-medium">adoptés</span> sur cet article dont chaque parlementaire
        est l&apos;auteur.
      </p>
      {influenceurs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-bordure bg-fond px-4 py-4 text-sm text-gris">
          Aucun amendement adopté sur cet article à cette étape : aucune contribution à classer.
        </p>
      ) : (
        <>
          <ol className="space-y-3">
            {apercu.map((i, idx) => (
              <LigneInfluenceur key={i.depute.id} i={i} rang={idx + 1} />
            ))}
          </ol>
          {reste > 0 && <div className="mt-2 text-xs text-gris">+{reste} autres députés</div>}
        </>
      )}

      <Modal open={voirTout} onClose={() => setVoirTout(false)}>
        <h2 className="mb-4 titre text-xl text-encre">Tous les contributeurs de cet article</h2>
        <ol className="space-y-3">
          {influenceurs.map((i, idx) => (
            <LigneInfluenceur key={i.depute.id} i={i} rang={idx + 1} />
          ))}
        </ol>
      </Modal>
    </div>
  );
}
