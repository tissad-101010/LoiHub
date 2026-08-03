import Link from "next/link";
import type { Amendement } from "@/lib/types";
import { badgeStatutClass, statutExplication } from "@/lib/ui";
import ParlementaireAvatar from "./ParlementaireAvatar";
import BarreVote from "./BarreVote";

// « Blame » d'un article : l'amendement à l'origine de sa rédaction actuelle,
// avec son auteur, son groupe, ses dates et — quand les députés ont voté dessus
// en séance — le résultat du scrutin. C'est la réponse à « qui a écrit ça, et
// est-ce que ça a été voté ? » sans quitter la page.
export default function OrigineModification({ amendement }: { amendement?: Amendement }) {
  if (!amendement) return null;
  const a = amendement;
  const fiche = /^PA\d+$/.test(a.auteur.id) ? `/depute/${encodeURIComponent(a.auteur.id)}` : null;

  return (
    <section className="border border-bordure bg-fond p-4">
      <h3 className="mb-3 text-sm font-semibold text-encre">Origine de cette modification</h3>

      <div className="flex flex-wrap items-center gap-2">
        <span className="ref-mono text-sm font-medium text-encre">Amendement n° {a.numero}</span>
        <span
          title={statutExplication[a.statut]}
          className={`cursor-help rounded px-1.5 py-0.5 text-xs font-medium ${badgeStatutClass[a.statut]}`}
        >
          {a.statut}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <ParlementaireAvatar depute={a.auteur} />
          <div className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-gris">Auteur</dt>
            <dd className="truncate text-sm text-encre">
              {fiche ? (
                <Link href={fiche} className="lien">
                  {a.auteur.nom}
                </Link>
              ) : (
                a.auteur.nom
              )}
            </dd>
          </div>
        </div>
        {a.auteur.groupe && (
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-gris">Groupe</dt>
            <dd className="flex items-center gap-1.5 text-sm text-encre">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: a.auteur.couleur }}
              />
              {a.auteur.groupe}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-gris">Déposé le</dt>
          <dd className="text-sm text-encre">{a.dateDepot || "—"}</dd>
        </div>
        {a.dateAdoption && (
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-gris">Adopté le</dt>
            <dd className="text-sm text-encre">{a.dateAdoption}</dd>
          </div>
        )}
        {a.alinea && (
          <div className="sm:col-span-2">
            <dt className="text-[11px] uppercase tracking-wide text-gris">Porte sur</dt>
            <dd className="text-sm text-encre">{a.alinea}</dd>
          </div>
        )}
      </dl>

      {a.scrutin && (
        <div className="mt-4 border-t border-bordure pt-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[11px] uppercase tracking-wide text-gris">Résultat du vote</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                a.scrutin.adopte ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {a.scrutin.adopte ? "Adopté" : "Rejeté"}
            </span>
          </div>
          <BarreVote scrutin={a.scrutin} legende />
          <p className="mt-1.5 text-xs text-gris">
            Scrutin public{a.scrutin.numero && ` n° ${a.scrutin.numero}`}
            {a.scrutin.date && ` du ${a.scrutin.date}`}.
          </p>
        </div>
      )}

      {a.uid && (
        <Link
          href={`/amendement/${encodeURIComponent(a.uid)}`}
          className="mt-4 inline-block border border-bleu px-3 py-1.5 text-sm font-medium text-bleu transition hover:bg-bleu-100"
        >
          Voir l&apos;amendement →
        </Link>
      )}
    </section>
  );
}
