import { ProjetLoi } from "@/lib/types";

type EnTeteLoi = Pick<
  ProjetLoi,
  "numero" | "titre" | "statut" | "statutVariant" | "dateDepot" | "datePromulgation" | "version" | "dossierUrl" | "loiPromulguee"
>;

// Couleur du badge de statut fidèle à l'état réel du texte : vert = abouti
// (promulguée/adoptée), bleu = en cours de procédure, gris = simple dépôt.
const BADGE_STATUT: Record<EnTeteLoi["statutVariant"], string> = {
  termine: "bg-green-500/20 text-green-400",
  encours: "bg-bleu-1000/20 text-bleu-100",
  depose: "bg-white/10 text-white/70",
};

export default function LoiHeader({ loi }: { loi: EnTeteLoi }) {
  return (
    <div className="bg-bleu p-6 text-white">
      <div className="ref-mono mb-2 inline-block rounded bg-white/10 px-2 py-1 text-xs">
        Dossier n° {loi.numero}
      </div>
      <h1 className="titre mb-2 text-3xl leading-tight">{loi.titre}</h1>
      <span className={`mb-4 inline-block px-2 py-1 text-xs font-medium ${BADGE_STATUT[loi.statutVariant]}`}>
        {loi.statut}
      </span>

      {loi.loiPromulguee && (
        <div className="mb-1 text-sm text-gray-300">
          {loi.loiPromulguee.urlLegifrance ? (
            <a
              href={loi.loiPromulguee.urlLegifrance}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white underline decoration-white/30 underline-offset-2 hover:decoration-white"
            >
              Loi n° {loi.loiPromulguee.numero}
              {loi.loiPromulguee.date && ` du ${loi.loiPromulguee.date}`}
            </a>
          ) : (
            <span className="font-medium text-white">
              Loi n° {loi.loiPromulguee.numero}
              {loi.loiPromulguee.date && ` du ${loi.loiPromulguee.date}`}
            </span>
          )}
          <span className="text-gris"> · Journal officiel</span>
        </div>
      )}
      <div className="mt-4 flex gap-8 text-sm text-gray-300">
        <div>
          <div className="text-gris">Déposé le</div>
          <div className="text-white">{loi.dateDepot || "—"}</div>
        </div>
        <div>
          <div className="text-gris">Promulgué le</div>
          <div className="text-white">{loi.datePromulgation || "en cours"}</div>
        </div>
      </div>
      {loi.dossierUrl && (
        <a
          href={loi.dossierUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-encre hover:bg-fond-alt"
        >
          Voir le dossier officiel sur assemblee-nationale.fr →
        </a>
      )}
    </div>
  );
}
