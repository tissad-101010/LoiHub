"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { DeputeListItem } from "@/lib/data";
import ParlementaireAvatar from "./ParlementaireAvatar";

export default function DeputesAnnuaire({ deputes }: { deputes: DeputeListItem[] }) {
  const [q, setQ] = useState("");
  const [groupe, setGroupe] = useState<string | null>(null);

  // Groupes présents, triés par nombre de députés.
  const groupes = useMemo(() => {
    const m = new Map<string, { groupe: string; couleur: string; n: number }>();
    for (const d of deputes) {
      if (!d.groupe) continue;
      const e = m.get(d.groupe) ?? { groupe: d.groupe, couleur: d.couleur, n: 0 };
      e.n += 1;
      m.set(d.groupe, e);
    }
    return [...m.values()].sort((a, b) => b.n - a.n);
  }, [deputes]);

  const filtres = useMemo(() => {
    const terme = q.trim().toLowerCase();
    return deputes.filter(
      (d) =>
        (!groupe || d.groupe === groupe) &&
        (!terme || d.nom.toLowerCase().includes(terme))
    );
  }, [deputes, q, groupe]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 border border-bordure bg-white p-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1 h-4 w-4 shrink-0 text-gris">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un député par nom…"
            className="flex-1 bg-transparent px-1 py-1 text-sm text-encre placeholder:text-gris focus:outline-none"
            aria-label="Rechercher un député"
          />
        </div>
        <div className="text-sm text-gris">{filtres.length.toLocaleString("fr-FR")} députés</div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setGroupe(null)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition ${
            groupe === null ? "bg-bleu text-white" : "border border-bordure text-gris hover:bg-fond"
          }`}
        >
          Tous
        </button>
        {groupes.map((g) => {
          const actif = groupe === g.groupe;
          return (
            <button
              key={g.groupe}
              onClick={() => setGroupe(actif ? null : g.groupe)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition"
              style={
                actif
                  ? { backgroundColor: g.couleur, borderColor: g.couleur, color: "#fff" }
                  : { borderColor: "#e5e7eb", color: "#475569" }
              }
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: actif ? "#fff" : g.couleur }} />
              {g.groupe}
              <span className={actif ? "text-white/70" : "text-gris"}>{g.n}</span>
            </button>
          );
        })}
      </div>

      {filtres.length === 0 ? (
        <p className="border border-dashed border-bordure bg-fond px-4 py-6 text-sm text-gris">
          Aucun député ne correspond à cette recherche.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtres.map((d) => (
            <Link
              key={d.uid}
              href={`/depute/${encodeURIComponent(d.uid)}`}
              className="flex items-center gap-3 border border-bordure bg-white p-3 transition hover:border-bleu hover:shadow-sm"
            >
              <ParlementaireAvatar depute={{ id: d.uid, nom: d.nom, groupe: d.groupe, couleur: d.couleur, photoUrl: d.photoUrl }} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-encre">{d.nom}</div>
                <div className="flex items-center gap-1.5 text-xs text-gris">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: d.couleur }} />
                  <span className="truncate" title={d.groupeLibelle}>{d.groupe || "—"}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-semibold text-encre">{d.amendements.toLocaleString("fr-FR")}</div>
                <div className="text-[11px] text-gris">amdts</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
