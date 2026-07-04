import { ProjetLoi } from "@/lib/types";

type EnTeteLoi = Pick<
  ProjetLoi,
  "numero" | "titre" | "statut" | "dateDepot" | "datePromulgation" | "version" | "dossierUrl"
>;

export default function LoiHeader({ loi }: { loi: EnTeteLoi }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-6 text-white">
      <div className="mb-2 inline-block rounded bg-white/10 px-2 py-1 text-xs">
        Dossier n° {loi.numero}
      </div>
      <h1 className="mb-2 text-2xl font-bold">{loi.titre}</h1>
      <span className="mb-4 inline-block rounded bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
        {loi.statut}
      </span>
      <div className="mt-4 flex gap-8 text-sm text-gray-300">
        <div>
          <div className="text-gray-400">Déposé le</div>
          <div className="text-white">{loi.dateDepot || "—"}</div>
        </div>
        <div>
          <div className="text-gray-400">Promulgué le</div>
          <div className="text-white">{loi.datePromulgation || "en cours"}</div>
        </div>
      </div>
      {loi.dossierUrl && (
        <a
          href={loi.dossierUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-gray-100"
        >
          Voir le dossier officiel sur assemblee-nationale.fr →
        </a>
      )}
    </div>
  );
}
