"use client";
import { useState } from "react";
import Terme from "./Terme";

// Guide de lecture citoyen : explique en langage simple comment lire la page
// d'une loi. Replié par défaut pour ne pas gêner les habitués ; l'état n'est
// volontairement pas persisté (localStorage) pour rester simple et sans cookie.

const ETAPES = [
  {
    icone: "📝",
    titre: "Un texte est déposé",
    texte: (
      <>
        Une loi commence par un <Terme mot="projet de loi">projet de loi</Terme>
        {" "}(du Gouvernement) ou une{" "}
        <Terme mot="proposition de loi">proposition de loi</Terme>
        {" "}(de parlementaires).
      </>
    ),
  },
  {
    icone: "🔁",
    titre: "Il est discuté et modifié",
    texte: (
      <>
        Le texte est retravaillé en <Terme mot="commission">commission</Terme>
        {" "}puis fait des allers-retours entre l&apos;Assemblée et le Sénat (la{" "}
        <Terme mot="navette">navette</Terme>). À chaque étape, les parlementaires proposent
        des <Terme mot="amendement">amendements</Terme>.
      </>
    ),
  },
  {
    icone: "🗳️",
    titre: "Les députés votent",
    texte: (
      <>
        Les votes importants ont lieu par <Terme mot="scrutin public">scrutin public</Terme>
        {" "}: la position de chaque député est enregistrée et consultable.
      </>
    ),
  },
  {
    icone: "✅",
    titre: "La loi entre en vigueur",
    texte: (
      <>
        Une fois adoptée (et validée par le{" "}
        <Terme mot="Conseil constitutionnel">Conseil constitutionnel</Terme>
        {" "}si saisi), la loi est signée par le président de la République :
        c&apos;est la <Terme mot="promulgation">promulgation</Terme>.
      </>
    ),
  },
];

export default function GuideLecture() {
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="border border-bordure bg-white">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-fond"
      >
        <span className="flex items-center gap-2.5">
          <span aria-hidden className="text-lg">💡</span>
          <span className="text-sm font-semibold text-encre">
            Comment naît une loi ? Comprendre cette page en 30 secondes
          </span>
        </span>
        <span
          aria-hidden
          className={`shrink-0 text-gris transition-transform ${ouvert ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {ouvert && (
        <div className="border-t border-bordure p-4">
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ETAPES.map((e, i) => (
              <li key={e.titre} className="relative rounded-lg bg-fond p-3.5">
                <div className="mb-1.5 flex items-center gap-2">
                  <span aria-hidden>{e.icone}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-bleu">
                    Étape {i + 1}
                  </span>
                </div>
                <div className="text-sm font-semibold text-encre">{e.titre}</div>
                <p className="mt-1 text-xs leading-relaxed text-gris">{e.texte}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs leading-relaxed text-gris">
            <span className="font-semibold text-encre">Sur cette page :</span> cliquez une étape
            du parcours pour voir le texte tel qu&apos;il était à ce moment-là.{" "}
            <span className="rounded bg-green-100 px-1 py-0.5 text-green-800">En vert</span> ce
            qui a été ajouté,{" "}
            <span className="rounded bg-red-100 px-1 py-0.5 text-red-800">en rouge</span> ce qui
            a été supprimé — comme un historique de versions. Les mots soulignés en pointillés
            affichent leur définition au survol.
          </p>
        </div>
      )}
    </div>
  );
}
