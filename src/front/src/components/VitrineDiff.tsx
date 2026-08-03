import Link from "next/link";
import type { ExtraitVitrine } from "@/lib/data";
import { badgeStatutClass } from "@/lib/ui";
import ParlementaireAvatar from "./ParlementaireAvatar";
import BarreVote from "./BarreVote";

// Bandeau d'accueil : montrer plutôt que promettre.
//
// Les maquettes du défi mettent un diff législatif en visuel principal. Celui-ci
// n'est pas une illustration : c'est un vrai changement de texte, sur une vraie
// loi, avec l'amendement qui l'a produit, son auteur et le vote — relu en base.
// Chaque élément est cliquable et mène à la page qui le détaille.
export default function VitrineDiff({ extrait }: { extrait: ExtraitVitrine }) {
  const { amendement: am } = extrait;
  const lignes = extrait.diff.filter((l) => l.type !== "inchange");

  return (
    <div className="border border-bordure bg-white">
      {/* fil d'Ariane de l'extrait : loi › article › amendement */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-bordure bg-fond px-4 py-2.5 text-xs">
        <Link href={`/loi/${extrait.dossierUid}`} className="font-medium text-bleu hover:underline">
          {extrait.dossierTitre}
        </Link>
        <span aria-hidden className="text-gris">
          ›
        </span>
        <span className="text-encre">Article {extrait.articleNumero}</span>
        {am && (
          <>
            <span aria-hidden className="text-gris">
              ›
            </span>
            <span className="ref-mono text-encre">Amendement n° {am.numero}</span>
            <span className={`rounded px-1.5 py-0.5 font-medium ${badgeStatutClass[am.statut]}`}>
              {am.statut}
            </span>
          </>
        )}
      </div>

      {/* le diff, en deux colonnes datées */}
      <div className="overflow-x-auto">
        <div className="min-w-[34rem]">
          <div className="grid grid-cols-2 border-b border-bordure text-[11px] text-gris">
            <div className="truncate border-r border-bordure px-3 py-1.5">{extrait.avant}</div>
            <div className="truncate px-3 py-1.5">{extrait.apres}</div>
          </div>
          <div className="grid grid-cols-2 font-mono text-[11px] leading-relaxed">
            <div className="border-r border-bordure">
              {lignes
                .filter((l) => l.type === "supprime")
                .map((l, i) => (
                  <div key={i} className="flex gap-1.5 bg-red-50 px-3 py-1 text-red-800">
                    <span aria-hidden className="select-none opacity-50">
                      −
                    </span>
                    <span className="whitespace-pre-wrap">{l.texte}</span>
                  </div>
                ))}
            </div>
            <div>
              {lignes
                .filter((l) => l.type === "ajoute")
                .map((l, i) => (
                  <div key={i} className="flex gap-1.5 bg-green-50 px-3 py-1 text-green-800">
                    <span aria-hidden className="select-none opacity-50">
                      +
                    </span>
                    <span className="whitespace-pre-wrap">{l.texte}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* qui, quel résultat, pourquoi */}
      {am && (
        <div className="grid grid-cols-1 divide-y divide-bordure border-t border-bordure sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex items-center gap-2.5 p-3">
            <ParlementaireAvatar depute={am.auteur} />
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-gris">Auteur</div>
              <div className="truncate text-sm text-encre">{am.auteur.nom}</div>
              {am.auteur.groupe && <div className="truncate text-xs text-gris">{am.auteur.groupe}</div>}
            </div>
          </div>

          <div className="p-3">
            <div className="text-[11px] uppercase tracking-wide text-gris">
              {am.scrutin ? "Résultat du vote" : "Adopté le"}
            </div>
            {am.scrutin ? (
              <div className="mt-1">
                <BarreVote scrutin={am.scrutin} legende />
              </div>
            ) : (
              <div className="text-sm text-encre">
                {am.dateAdoption || am.dateDepot || "—"}
                <span className="mt-0.5 block text-xs text-gris">
                  Pas de scrutin public nominatif sur cet amendement.
                </span>
              </div>
            )}
          </div>

          <div className="p-3">
            <div className="text-[11px] uppercase tracking-wide text-gris">Pourquoi ce changement ?</div>
            <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-gris">
              {extrait.motif ?? "L'auteur n'a pas publié d'exposé sommaire pour cet amendement."}
            </p>
            {am.uid && (
              <Link
                href={`/amendement/${encodeURIComponent(am.uid)}`}
                className="mt-1 inline-block text-xs font-medium text-bleu hover:underline"
              >
                Lire l&apos;amendement →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
