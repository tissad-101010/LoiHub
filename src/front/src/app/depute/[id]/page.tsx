import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { getDepute } from "@/lib/data";
import { badgeStatutClass } from "@/lib/ui";
import type { DeputeProfil } from "@/lib/types";

export const dynamic = "force-dynamic";

/* ------------------------------- Helpers ------------------------------- */

function initials(nom: string) {
  const parts = nom.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?") + (parts[parts.length - 1]?.[0] ?? "");
}

// "il y a X ans/mois" à partir d'une date de prise de fonction ISO
function ancienneteLabel(iso?: string): string | null {
  if (!iso) return null;
  const debut = new Date(iso);
  if (isNaN(debut.getTime())) return null;
  const mois = Math.max(
    0,
    Math.round((Date.now() - debut.getTime()) / (1000 * 60 * 60 * 24 * 30.44)),
  );
  if (mois < 1) return "ce mois-ci";
  if (mois < 12) return `depuis ${mois} mois`;
  const ans = Math.floor(mois / 12);
  const reste = mois % 12;
  return reste >= 6 ? `depuis ${ans} ans et demi` : `depuis ${ans} an${ans > 1 ? "s" : ""}`;
}

/* ------------------------------ Sous-vues ------------------------------ */

function Portrait({ depute }: { depute: DeputeProfil }) {
  if (depute.photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- portrait officiel AN, déjà optimisé
      <img
        src={depute.photoUrl}
        alt={`Portrait de ${depute.nom}`}
        className="h-28 w-28 shrink-0 rounded-2xl object-cover ring-2 ring-white/20 sm:h-32 sm:w-32"
      />
    );
  }
  return (
    <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl font-semibold text-white/70 ring-2 ring-white/20 sm:h-32 sm:w-32">
      {initials(depute.nom)}
    </span>
  );
}

function StatCard({ valeur, label }: { valeur: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
      <div className="text-2xl font-bold text-slate-900">
        {typeof valeur === "number" ? valeur.toLocaleString("fr-FR") : valeur}
      </div>
      <div className="mt-0.5 text-xs text-gray-500">{label}</div>
    </div>
  );
}

function Section({ titre, count, children }: { titre: string; count?: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900">{titre}</h2>
        {count !== undefined && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            {count.toLocaleString("fr-FR")}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
      {children}
    </p>
  );
}

/* -------------------------------- Page --------------------------------- */

export default async function DeputePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const depute = await getDepute(decodeURIComponent(id));

  if (!depute) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-3xl p-10">
          <h1 className="text-2xl font-bold text-slate-900">Député introuvable</h1>
          <p className="mt-4 text-slate-600">
            Aucun député avec l&apos;identifiant {id}. Seuls les députés de l&apos;Assemblée
            nationale (législature 17) sont référencés.
          </p>
          <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
            ← Retour à l&apos;accueil
          </Link>
        </main>
      </div>
    );
  }

  const feminin = depute.civilite === "Mme";
  const anciennete = ancienneteLabel(depute.dateDebutMandatIso);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-8 p-6">
        {/* En-tête : carte sombre teintée de la couleur politique (comme LoiHeader) */}
        <div
          className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white sm:p-8"
          style={{
            backgroundImage: `linear-gradient(135deg, ${depute.couleur}33 0%, transparent 55%)`,
          }}
        >
          {/* bande de couleur du groupe */}
          <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: depute.couleur }} />

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Portrait depute={depute} />

            <div className="min-w-0 flex-1">
              {depute.groupe && (
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20"
                  style={{ backgroundColor: depute.couleur }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  {depute.groupeLibelle ?? depute.groupe}
                  {depute.groupeLibelle && <span className="opacity-70">· {depute.groupe}</span>}
                </span>
              )}

              <h1 className="mt-3 text-3xl font-bold">{depute.nom}</h1>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-gray-300">
                <span>Député{feminin ? "e" : ""} à l&apos;Assemblée nationale</span>
                {depute.fonction && (
                  <>
                    <span className="text-gray-500">·</span>
                    <span className="font-medium text-white">{depute.fonction}</span>
                  </>
                )}
                {depute.circonscription && (
                  <>
                    <span className="text-gray-500">·</span>
                    <span>{depute.circonscription}</span>
                  </>
                )}
              </div>

              {depute.dateDebutMandat && (
                <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-gray-400">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                  </svg>
                  <span>
                    Élu{feminin ? "e" : ""} depuis le {depute.dateDebutMandat}
                    {anciennete && <span className="text-gray-400"> ({anciennete})</span>}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard valeur={depute.stats.amendements} label="Amendements déposés" />
          <StatCard valeur={depute.stats.amendementsAdoptes} label="Amendements adoptés" />
          <StatCard valeur={depute.stats.textesDeposes} label="Textes déposés" />
          <StatCard valeur={depute.stats.votes || "—"} label="Votes recensés" />
        </div>

        {/* Derniers amendements */}
        <Section titre="Derniers amendements" count={depute.stats.amendements}>
          {depute.derniersAmendements.length === 0 ? (
            <EmptyCard>Aucun amendement déposé par ce député dans les données disponibles.</EmptyCard>
          ) : (
            <ul className="space-y-2">
              {depute.derniersAmendements.map((a, i) => {
                const inner = (
                  <div className="flex items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 transition hover:border-gray-300 hover:shadow-sm">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">Amendement {a.numero}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeStatutClass[a.statut]}`}
                        >
                          {a.statut}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate text-xs text-gray-500">
                        {a.dossierTitre ?? "Dossier inconnu"}
                      </div>
                    </div>
                    <div className="shrink-0 text-right text-xs text-gray-400">
                      {a.dateDepot && <div>{a.dateDepot}</div>}
                      {a.dossierUid && <div className="mt-0.5 text-blue-600">Voir la loi →</div>}
                    </div>
                  </div>
                );
                return (
                  <li key={`${a.numero}-${i}`}>
                    {a.dossierUid ? (
                      <Link href={`/loi/${encodeURIComponent(a.dossierUid)}`}>{inner}</Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Textes déposés */}
        <Section titre="Textes déposés" count={depute.stats.textesDeposes}>
          {depute.textesDeposes.length === 0 ? (
            <EmptyCard>
              Aucun texte déposé à l&apos;initiative de ce député dans les données disponibles.
            </EmptyCard>
          ) : (
            <ul className="space-y-2">
              {depute.textesDeposes.map((t) => (
                <li key={t.uid}>
                  <Link href={`/loi/${encodeURIComponent(t.uid)}`}>
                    <div className="flex items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 transition hover:border-gray-300 hover:shadow-sm">
                      <div className="min-w-0">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {t.type}
                        </span>
                        <div className="mt-1 text-sm font-medium text-slate-900">{t.titre}</div>
                      </div>
                      <div className="shrink-0 text-right text-xs text-gray-400">
                        {t.date && <div>{t.date}</div>}
                        {t.amendements > 0 && (
                          <div className="mt-0.5">{t.amendements.toLocaleString("fr-FR")} amdt.</div>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Votes */}
        <Section titre="Votes">
          {depute.votes.length === 0 ? (
            <EmptyCard>
              Les scrutins nominatifs ne sont pas encore importés dans LoiHub — les votes de ce
              député seront affichés ici prochainement.
            </EmptyCard>
          ) : (
            <ul className="space-y-2">
              {depute.votes.map((v, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3"
                >
                  <span className="min-w-0 truncate text-sm text-slate-900">{v.objet}</span>
                  <span className="shrink-0 text-sm font-medium text-slate-700">{v.position}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </main>
    </div>
  );
}
