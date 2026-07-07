import Link from "next/link";
import { LoiResume } from "@/lib/types";
import { COULEUR_ACTEUR, libelleRef } from "@/lib/ui";

function TagEtape({ loi }: { loi: LoiResume }) {
  const c = COULEUR_ACTEUR[loi.etape.acteur];
  return (
    <span
      className="inline-flex w-fit items-center gap-1.5 px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: c.clair, color: c.accent }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.accent }} />
      {loi.etape.label}
    </span>
  );
}

function Chiffres({ loi }: { loi: LoiResume }) {
  return (
    <div className="flex gap-5 text-xs text-gris">
      <span>
        <span className="ref-mono font-semibold text-encre">{loi.amendements.toLocaleString("fr-FR")}</span> amdts
      </span>
      <span>
        <span className="ref-mono font-semibold text-encre">{loi.deputesImpliques}</span> députés
      </span>
    </div>
  );
}

export default function LoiCard({ loi, layout = "vertical" }: { loi: LoiResume; layout?: "vertical" | "horizontal" }) {
  const ref = libelleRef(loi.type, loi.numeroAffiche ?? loi.numero.match(/N(\d+)/)?.[1] ?? loi.numero, loi.chambre);

  if (layout === "horizontal") {
    return (
      <Link
        href={`/loi/${loi.numero}`}
        className="group grid grid-cols-[1fr_auto] items-center gap-4 border border-bordure bg-white p-4 transition hover:border-bleu hover:shadow-[0_6px_20px_rgba(0,0,18,0.07)]"
      >
        <div className="min-w-0">
          <div className="ref-mono text-[11px] text-gris">{ref}</div>
          <h3 className="titre truncate text-base text-encre group-hover:text-bleu">{loi.titre}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <TagEtape loi={loi} />
            <span className="text-xs text-gris">MàJ {loi.derniereActualite}</span>
          </div>
        </div>
        <div className="hidden text-right md:block">
          <Chiffres loi={loi} />
          <span className="mt-1 inline-block text-sm font-semibold text-bleu">Ouvrir →</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/loi/${loi.numero}`}
      className="group flex flex-col border border-bordure bg-white p-5 transition hover:border-bleu hover:shadow-[0_6px_20px_rgba(0,0,18,0.07)]"
    >
      <div className="flex items-center justify-between">
        <span className="ref-mono text-[11px] text-gris">{ref}</span>
        <TagEtape loi={loi} />
      </div>
      <h3 className="titre mt-3 text-lg leading-snug text-encre group-hover:text-bleu">{loi.titre}</h3>
      <div className="mt-2 text-xs text-gris">Dernière actualité : {loi.derniereActualite}</div>
      <div className="mt-4 flex items-center justify-between border-t border-bordure pt-3">
        <Chiffres loi={loi} />
        <span className="text-sm font-semibold text-bleu group-hover:underline">Ouvrir →</span>
      </div>
    </Link>
  );
}
