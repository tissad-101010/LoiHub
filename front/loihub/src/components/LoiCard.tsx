import Link from "next/link";
import { IconeThematique, LoiResume } from "@/lib/types";

const ICONES: Record<IconeThematique, { bg: string; fg: string; path: React.ReactNode }> = {
  logement: {
    bg: "bg-blue-100",
    fg: "text-blue-600",
    path: (
      <>
        <path d="M12 3l8 4v2H4V7l8-4z" strokeLinejoin="round" />
        <path d="M5 10v8M9 10v8M15 10v8M19 10v8" strokeLinecap="round" />
        <path d="M4 20h16" strokeLinecap="round" />
      </>
    ),
  },
  energie: {
    bg: "bg-green-100",
    fg: "text-green-600",
    path: <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" strokeLinejoin="round" strokeLinecap="round" />,
  },
  numerique: {
    bg: "bg-purple-100",
    fg: "text-purple-600",
    path: (
      <>
        <path d="M7 17a4 4 0 0 1-1-7.9A5 5 0 0 1 15.9 8 4.5 4.5 0 0 1 17 17H7z" strokeLinejoin="round" />
      </>
    ),
  },
};

export default function LoiCard({ loi }: { loi: LoiResume }) {
  const icone = ICONES[loi.icone];
  const enRedaction = loi.avancement !== undefined;

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{loi.titre}</h3>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${icone.bg} ${icone.fg}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            {icone.path}
          </svg>
        </span>
      </div>

      {enRedaction ? (
        <div className="mb-4">
          <div className="mb-1 text-xs text-gray-500">
            Statut : Rédaction de première version ({loi.avancement}%)
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100">
            <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${loi.avancement}%` }} />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 text-xs text-gray-500">Adoptée définitivement le {loi.dateAdoption}</div>
          <div className="mb-4 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" strokeLinejoin="round" />
              </svg>
              {loi.amendements.toLocaleString("fr-FR")} amendements
            </span>
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
              </svg>
              {loi.deputesImpliques} députés impliqués
            </span>
          </div>
        </>
      )}

      <Link href={`/loi/${loi.numero}`} className="mt-auto text-sm font-medium text-blue-600 hover:underline">
        {enRedaction ? "Suivre l'avancement →" : "Explorer la loi →"}
      </Link>
    </div>
  );
}
