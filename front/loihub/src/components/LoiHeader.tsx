import { ProjetLoi } from "@/lib/types";

type EnTeteLoi = Pick<ProjetLoi, "numero" | "titre" | "statut" | "dateDepot" | "datePromulgation" | "version">;

export default function LoiHeader({ loi }: { loi: EnTeteLoi }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-6 text-white">
      <div className="mb-2 inline-block rounded bg-white/10 px-2 py-1 text-xs">
        Projet de loi n° {loi.numero}
      </div>
      <h1 className="mb-2 text-2xl font-bold">{loi.titre}</h1>
      <span className="mb-4 inline-block rounded bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
        {loi.statut}
      </span>
      <div className="mt-4 flex gap-8 text-sm text-gray-300">
        <div>
          <div className="text-gray-400">Déposé le</div>
          <div className="text-white">{loi.dateDepot}</div>
        </div>
        <div>
          <div className="text-gray-400">Promulgué le</div>
          <div className="text-white">{loi.datePromulgation}</div>
        </div>
        <div>
          <div className="text-gray-400">Dernière version</div>
          <div className="text-white">{loi.version}</div>
        </div>
      </div>
      <button className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900">
        Voir le dossier législatif →
      </button>
    </div>
  );
}
