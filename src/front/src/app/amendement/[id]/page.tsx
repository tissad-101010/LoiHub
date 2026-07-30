import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Fil from "@/components/Fil";
import ParlementaireAvatar from "@/components/ParlementaireAvatar";
import { getAmendement } from "@/lib/data";
import { badgeStatutClass, statutExplication } from "@/lib/ui";
import ResumeIABouton from "@/components/ResumeIABouton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const a = await getAmendement(decodeURIComponent(id));
  if (!a) return { title: "Amendement introuvable" };
  return {
    title: `Amendement n°${a.numero}`,
    description: `Amendement n°${a.numero} de ${a.auteur.nom} — ${a.statut}${a.dossierTitre ? ` · ${a.dossierTitre}` : ""}.`,
  };
}

function renderDispositif(texte: string) {
  return texte.split(/(«[^»]*»)/g).map((part, i) =>
    /^«[^»]*»$/.test(part) ? (
      <mark key={i} className="rounded bg-bleu-100 px-1 font-medium text-encre">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default async function AmendementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getAmendement(decodeURIComponent(id));

  // vrai 404 (voir not-found.tsx) au lieu d'une page d'erreur servie en 200
  if (!a) notFound();

  const lienFiche = /^PA\d+$/.test(a.auteur.id);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <Fil
          items={[
            { label: "Accueil", href: "/" },
            ...(a.dossierUid ? [{ label: a.dossierTitre ?? "Loi", href: `/loi/${encodeURIComponent(a.dossierUid)}` }] : []),
            { label: `Amendement n°${a.numero}` },
          ]}
        />
        {/* En-tête */}
        <div className="bg-bleu p-6 text-white">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/60">Amendement</span>
            <span
              title={statutExplication[a.statut]}
              className={`rounded px-2 py-0.5 text-xs font-medium ${badgeStatutClass[a.statut]}`}
            >
              {a.statut}
            </span>
          </div>
          <h1 className="text-2xl font-bold">Amendement n°{a.numero}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-white/70">
            Un amendement est une proposition de modification d&apos;un texte de loi,
            déposée par un ou plusieurs parlementaires, puis adoptée ou rejetée par un vote.
          </p>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-300">
            {a.article && <span>{a.article}</span>}
            {a.alinea && <span>· {a.alinea}</span>}
            {a.dateDepot && <span>· Déposé le {a.dateDepot}</span>}
            {a.dateSort && <span>· {a.statut} le {a.dateSort}</span>}
          </div>
        </div>

        {/* Auteur */}
        <section className="border border-bordure bg-white p-5">
          <h2 className="mb-3 text-sm font-medium text-gris">Auteur</h2>
          <div className="flex items-center gap-3">
            <ParlementaireAvatar depute={a.auteur} />
            <div>
              <div className="text-sm font-medium text-encre">{a.auteur.nom}</div>
              {a.auteur.groupe && (
                <div className="flex items-center gap-1.5 text-xs text-gris">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: a.auteur.couleur }} />
                  {a.auteur.groupe}
                </div>
              )}
            </div>
            {lienFiche && (
              <Link
                href={`/depute/${encodeURIComponent(a.auteur.id)}`}
                className="ml-auto text-sm font-medium text-bleu hover:underline"
              >
                Voir la fiche →
              </Link>
            )}
          </div>

          {a.cosignataires.length > 0 && (
            <div className="mt-4 border-t border-bordure pt-3">
              <div className="mb-2 text-xs font-medium text-gris">
                {a.cosignataires.length} cosignataire{a.cosignataires.length > 1 ? "s" : ""}
                <span className="font-normal"> — parlementaires qui soutiennent officiellement cet amendement</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {a.cosignataires.map((c) =>
                  /^PA\d+$/.test(c.id) ? (
                    <Link
                      key={c.id}
                      href={`/depute/${encodeURIComponent(c.id)}`}
                      className="flex items-center gap-1.5 rounded-full border border-bordure py-0.5 pl-0.5 pr-2 text-xs text-encre transition hover:border-bleu hover:bg-fond"
                    >
                      <ParlementaireAvatar depute={c} size="sm" />
                      <span className="max-w-[10rem] truncate">{c.nom}</span>
                    </Link>
                  ) : (
                    <span key={c.id} className="flex items-center gap-1.5 rounded-full border border-bordure py-0.5 pl-0.5 pr-2 text-xs text-encre">
                      <ParlementaireAvatar depute={c} size="sm" />
                      <span className="max-w-[10rem] truncate">{c.nom}</span>
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </section>

        {/* Vote en séance : scrutin public portant précisément sur cet amendement. */}
        {a.scrutin && (
          <section className="border border-bordure bg-white p-5">
            <div className="mb-1 flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-gris">Le vote des députés sur cet amendement</h2>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  a.scrutin.adopte ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {a.scrutin.adopte ? "Adopté" : "Rejeté"}
              </span>
            </div>
            <p className="mb-3 text-xs text-gris">
              Scrutin public{a.scrutin.numero && <> n°{a.scrutin.numero}</>}
              {a.scrutin.date && <> du {a.scrutin.date}</>} — la position de chaque député est
              enregistrée et publique.
            </p>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-fond-alt">
              {(() => {
                const total = a.scrutin.pour + a.scrutin.contre + a.scrutin.abstention || 1;
                const seg = (n: number) => `${(n / total) * 100}%`;
                return (
                  <>
                    <div style={{ width: seg(a.scrutin.pour) }} className="bg-green-500" />
                    <div style={{ width: seg(a.scrutin.contre) }} className="bg-red-500" />
                    <div style={{ width: seg(a.scrutin.abstention) }} className="bg-gray-400" />
                  </>
                );
              })()}
            </div>
            <div className="mt-2 flex gap-5 text-sm">
              <span><span className="ref-mono font-bold text-green-700">{a.scrutin.pour}</span> <span className="text-gris">pour</span></span>
              <span><span className="ref-mono font-bold text-red-700">{a.scrutin.contre}</span> <span className="text-gris">contre</span></span>
              <span><span className="ref-mono font-bold text-encre">{a.scrutin.abstention}</span> <span className="text-gris">abstention{a.scrutin.abstention > 1 ? "s" : ""}</span></span>
            </div>
          </section>
        )}

        {/* Exposé des motifs : le « pourquoi » rédigé par l'auteur (langage clair). */}
        {a.exposeSommaire && (
          <section className="border border-bordure bg-white p-5">
            <h2 className="mb-1 text-sm font-medium text-gris">Exposé des motifs</h2>
            <p className="mb-3 text-xs text-gris">
              Le « pourquoi » : les raisons de cette modification, expliquées par son auteur.
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-encre">{a.exposeSommaire}</p>
          </section>
        )}

        {/* Dispositif */}
        <section className="border border-bordure bg-white p-5">
          <h2 className="mb-1 text-sm font-medium text-gris">Dispositif de l&apos;amendement</h2>
          <p className="mb-3 text-xs text-gris">
            Le « comment » : l&apos;instruction précise de ce que l&apos;amendement change dans le
            texte (les termes cités sont <mark className="rounded bg-bleu-100 px-1">surlignés</mark>).
          </p>
          {a.dispositif ? (
            <>
              {/* Résumé en langage clair (IA), à la demande : dispositif + exposé */}
              <ResumeIABouton
                type="amendement"
                texte={[a.dispositif, a.exposeSommaire ? `Exposé des motifs : ${a.exposeSommaire}` : ""]
                  .filter(Boolean)
                  .join("\n\n")}
              />
              <p className="whitespace-pre-line text-sm leading-relaxed text-encre">
                {renderDispositif(a.dispositif)}
              </p>
            </>
          ) : (
            <p className="text-sm text-gris">
              Le dispositif de cet amendement n&apos;est pas disponible dans les données de l&apos;Assemblée nationale.
            </p>
          )}
        </section>

        {/* Loi rattachée */}
        {a.dossierUid && (
          <Link
            href={`/loi/${encodeURIComponent(a.dossierUid)}`}
            className="flex items-center justify-between border border-bordure bg-white p-4 transition hover:border-bleu hover:shadow-sm"
          >
            <div>
              <div className="text-xs text-gris">Texte concerné</div>
              <div className="text-sm font-medium text-encre">{a.dossierTitre ?? a.dossierUid}</div>
            </div>
            <span className="shrink-0 text-sm font-medium text-bleu">Voir la loi →</span>
          </Link>
        )}
      </main>
    </div>
  );
}
