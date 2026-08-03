// « git blame » législatif : pour chaque alinéa d'un article, quelle version du
// texte l'a introduit, et — quand la correspondance est certaine — quel
// amendement adopté en est à l'origine.
//
// Ce que ce module affirme, et sur quelles données :
//
//  - L'attribution à une VERSION est exacte. Elle se déduit uniquement de
//    `LawText` (les textes officiels successifs publiés par l'AN) : si un alinéa
//    apparaît pour la première fois dans le « Texte de la commission », c'est un
//    fait, pas une estimation.
//
//  - L'attribution à un AMENDEMENT est une reconstitution, parce que l'open data
//    ne relie pas un amendement à l'alinéa résultant. On ne la propose donc que
//    sous trois conditions cumulatives, et on s'abstient sinon :
//      1. l'amendement est adopté ;
//      2. il vise explicitement ce numéro d'alinéa (champ officiel `alinea`, ou
//         « alinéa N » cité dans son dispositif) ;
//      3. il est le SEUL dans ce cas sur la fenêtre de temps de la version.
//    La numérotation des alinéas bougeant d'une version à l'autre, la condition 3
//    évite d'attribuer une phrase au mauvais auteur — mieux vaut ne rien dire.

import { diffLines } from "./diff";
import type { Amendement, BlameAlinea, VersionArticle } from "./types";
import { texteEstPartiel } from "./ui";

// Comparaison de deux alinéas : on ignore les seules différences d'espacement,
// qui varient d'un texte publié à l'autre sans changer le fond.
const normalise = (s: string) => s.replace(/\s+/g, " ").trim();

// Alignement des alinéas entre deux versions, déduit du diff : pour chaque index
// d'alinéa de la version APRÈS, l'index correspondant dans la version AVANT, ou
// null si l'alinéa est nouveau.
//
// C'est la pièce qui rend l'attribution utilisable. Un amendement écrit « Alinéa
// 6 » en désignant la numérotation du texte QU'IL AMENDE — pas celle du texte
// final, où le même contenu a pu glisser au 9e rang. Sans cet alignement, la
// comparaison de numéros échoue presque toujours (ou, pire, tombe par hasard sur
// le mauvais alinéa).
function aligneAlineas(avant: string[], apres: string[]): (number | null)[] {
  const out: (number | null)[] = new Array(apres.length).fill(null);
  let i = 0; // curseur dans `avant`
  let j = 0; // curseur dans `apres`
  // Un alinéa REFORMULÉ apparaît dans le diff comme un retrait suivi d'un ajout :
  // il n'a donc pas de ligne « inchangé » à laquelle s'accrocher. On apparie donc
  // chaque bloc retiré/ajouté rang par rang — sans quoi un alinéa modifié serait
  // considéré comme nouveau et rattaché à tort à l'alinéa qui le précède.
  let retires: number[] = [];
  let ajoutes: number[] = [];
  const solder = () => {
    for (let k = 0; k < ajoutes.length; k++) {
      out[ajoutes[k]] = k < retires.length ? retires[k] : null;
    }
    retires = [];
    ajoutes = [];
  };

  for (const l of diffLines(avant, apres)) {
    if (l.type === "inchange") {
      solder();
      if (j < out.length) out[j] = i;
      i++;
      j++;
    } else if (l.type === "supprime") {
      retires.push(i);
      i++;
    } else {
      ajoutes.push(j);
      j++;
    }
  }
  solder();
  return out;
}

// Numéros d'alinéas visés par un amendement. Source prioritaire : le champ
// officiel AN `alinea` (« Alinéa 13 », « Après l'alinéa 7 »). À défaut, les
// « alinéa N » cités dans le dispositif.
export function alineasVises(am: Pick<Amendement, "alinea" | "dispositif">): Set<number> {
  const set = new Set<number>();
  if (am.alinea) for (const m of am.alinea.matchAll(/(\d+)/g)) set.add(parseInt(m[1], 10));
  if (set.size === 0 && am.dispositif)
    for (const m of am.dispositif.matchAll(/alin[ée]as?\s*n?°?\s*(\d+)/gi)) set.add(parseInt(m[1], 10));
  return set;
}

// Date de référence (ISO) pour situer un amendement entre deux versions : la date
// de son sort quand elle est connue — c'est là qu'il entre dans le texte —, sinon
// son dépôt.
const dateReference = (a: Amendement) => a.dateSortIso ?? a.dateDepotIso ?? "";

// Longueur minimale d'un fragment cité pour qu'il vaille preuve. En dessous, des
// formules courantes (« la présente loi », « du code de la santé publique »)
// apparaîtraient dans des dizaines d'alinéas sans rien démontrer.
const FRAGMENT_MIN = 40;

// Second mode d'attribution, textuel : le dispositif de l'amendement reproduit
// entre guillemets un fragment substantiel qu'on retrouve mot pour mot dans
// l'alinéa. C'est une preuve directe, indépendante de toute numérotation — donc
// robuste là où les alinéas ont été renumérotés ou l'article réécrit.
function citeLitteralement(dispositif: string | undefined, alinea: string): boolean {
  if (!dispositif) return false;
  const cible = normalise(alinea);
  for (const m of dispositif.matchAll(/«([^»]+)»/g)) {
    const fragment = normalise(m[1]);
    if (fragment.length >= FRAGMENT_MIN && cible.includes(fragment)) return true;
  }
  return false;
}

// Libellé court d'une version, pour la gouttière de blame où la place manque.
// « Texte de la commission (18 juin 2025) » -> « commission ».
export function libelleCourtVersion(label: string): string {
  if (/commission/i.test(label)) return "commission";
  if (/s[ée]ance/i.test(label)) return "séance";
  if (/navette|transmis/i.test(label)) return "navette";
  if (/d[ée]pos/i.test(label)) return "dépôt";
  return label.replace(/\s*\(.*$/, "");
}

export interface BlameOptions {
  versions: VersionArticle[]; // par ordre chronologique (LawText.ordre)
  historique: Amendement[]; // amendements de CET article
  indexAffiche: number; // index dans `versions` de la version affichée
}

export function calculeBlame({ versions, historique, indexAffiche }: BlameOptions): BlameAlinea[] {
  const affichee = versions[indexAffiche];
  if (!affichee) return [];

  // Versions retenues pour la recherche d'antériorité : uniquement les textes
  // COMPLETS. Un « texte adopté en séance » ne reproduit que les parties
  // modifiées (« (Non modifiée) ») : l'absence d'un alinéa n'y signifie pas
  // qu'il n'existait pas, on ne peut donc rien en conclure.
  const completes = versions
    .map((v, i) => ({ v, i }))
    .filter(({ v, i }) => i <= indexAffiche && !texteEstPartiel(v.alineas));

  const adoptes = historique.filter((a) => a.statut === "Adopté");

  // Alignements calculés au plus une fois par version introductrice.
  const alignements = new Map<number, (number | null)[]>();
  const alignement = (indexVersion: number, avant: string[], apres: string[]) => {
    let a = alignements.get(indexVersion);
    if (!a) {
      a = aligneAlineas(avant, apres);
      alignements.set(indexVersion, a);
    }
    return a;
  };

  return affichee.alineas.map((texte, index) => {
    const cible = normalise(texte);

    // première version connue (parmi les complètes) contenant ce même alinéa
    const introduit =
      completes.find(({ v }) => v.alineas.some((l) => normalise(l) === cible)) ??
      completes[completes.length - 1] ??
      { v: affichee, i: indexAffiche };

    const versionPrecedente = completes.filter(({ i }) => i < introduit.i).pop()?.v;
    const origine = introduit.i === (completes[0]?.i ?? 0);

    // Amendement adopté visant cet alinéa, dans la fenêtre de temps de la
    // version qui l'a introduit — et seulement s'il est le seul candidat.
    let amendement: Amendement | undefined;
    let motif: BlameAlinea["motif"] = origine ? "origine" : "alinea-non-resolu";
    let nbCandidats = 0;
    let numeroViseRetenu: number | undefined;
    if (!origine && versionPrecedente) {
      const borneBasse = versionPrecedente.dateIso ?? "";
      const borneHaute = introduit.v.dateIso ?? "";
      // Amendements adoptés pendant l'étape qui a produit cette version.
      const dansLaFenetre = adoptes.filter((a) => {
        const d = dateReference(a);
        if (!d || !borneHaute) return true; // date inconnue : on ne peut pas exclure
        return d <= borneHaute && (!borneBasse || d >= borneBasse);
      });

      // 1) Preuve textuelle : le dispositif cite l'alinéa mot pour mot.
      let candidats = dansLaFenetre.filter((a) => citeLitteralement(a.dispositif, texte));

      // 2) À défaut, correspondance de numéro d'alinéa — mais seulement si
      //    l'alinéa a un vis-à-vis DIRECT dans la version précédente. Pour un
      //    alinéa inséré, on renonce : le déduire de l'alinéa qui le précède
      //    fabriquait des numéros faux (et donc, parfois, de fausses
      //    attributions), ce qui est pire que ne rien affirmer.
      if (candidats.length === 0) {
        const rangIntroduit = introduit.v.alineas.findIndex((l) => normalise(l) === cible);
        const carte = alignement(introduit.i, versionPrecedente.alineas, introduit.v.alineas);
        const rangAvant = rangIntroduit >= 0 ? carte[rangIntroduit] : null;
        if (rangAvant !== null) {
          numeroViseRetenu = rangAvant + 1;
          candidats = dansLaFenetre.filter((a) => alineasVises(a).has(rangAvant + 1));
        }
      }

      // Exigence d'unicité : deux amendements possibles, on se tait.
      nbCandidats = candidats.length;
      if (candidats.length === 1) {
        amendement = candidats[0];
        motif = undefined;
      } else if (candidats.length > 1) {
        motif = "plusieurs-candidats";
      } else {
        motif = numeroViseRetenu === undefined ? "alinea-non-resolu" : "aucun-candidat";
      }
    }

    return {
      index,
      versionLabel: introduit.v.label,
      versionDateIso: introduit.v.dateIso,
      origine,
      amendement,
      motif,
      ...(motif === "plusieurs-candidats" ? { candidats: nbCandidats } : {}),
      ...(numeroViseRetenu !== undefined ? { numeroVise: numeroViseRetenu } : {}),
    };
  });
}
