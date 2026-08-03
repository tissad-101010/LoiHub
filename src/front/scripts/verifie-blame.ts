// Contrôle du « blame » par alinéa (lib/blame.ts) sur des données réelles.
//
// Pourquoi un script plutôt qu'un test unitaire : ce qu'on veut vérifier n'est pas
// la mécanique de la fonction mais sa RENTABILITÉ sur l'open data — combien
// d'alinéas reçoivent une attribution à un amendement, et si ces attributions
// tiennent. Ça se mesure sur la base, pas sur des fixtures inventées.
//
//   npx tsx scripts/verifie-blame.ts [dossierUid] [numeroArticle]

import { calculeBlame } from "../src/lib/blame";
import { getArticleDetail, getProjetLoi } from "../src/lib/data";
import { texteEstPartiel } from "../src/lib/ui";

async function main() {
  const dossierUid = process.argv[2] ?? "DLR5L16N47697";
  const projet = await getProjetLoi(dossierUid);
  if (!projet) throw new Error(`dossier introuvable : ${dossierUid}`);

  const numeros = process.argv[3]
    ? [process.argv[3]]
    : projet.articles.slice(0, 12).map((a) => a.numero);

  console.log(`${projet.titre} (${dossierUid})`);
  console.log(`${projet.articles.length} articles amendés, ${numeros.length} examinés\n`);

  let totalAlineas = 0;
  let totalAttribues = 0;

  for (const numero of numeros) {
    const detail = await getArticleDetail(dossierUid, numero);
    if (!detail?.versionsTexte.length) {
      console.log(`Article ${numero} : aucune version publiée`);
      continue;
    }
    const indexAffiche = detail.versionsTexte.length - 1;
    if (texteEstPartiel(detail.versionsTexte[indexAffiche].alineas)) {
      console.log(`Article ${numero} : dernière version = texte de séance, blame écarté`);
      continue;
    }
    const blame = calculeBlame({
      versions: detail.versionsTexte,
      historique: detail.historique,
      indexAffiche,
    });
    const attribues = blame.filter((b) => b.amendement);
    totalAlineas += blame.length;
    totalAttribues += attribues.length;

    const versions = new Set(blame.map((b) => (b.origine ? "texte initial" : b.versionLabel)));
    const parMotif = blame.reduce<Record<string, number>>((acc, b) => {
      const k = b.motif ?? "attribué";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});
    console.log(
      `Article ${numero} : ${blame.length} alinéas, ${attribues.length} attribués à un amendement, ` +
        `${versions.size} versions d'origine distinctes — ` +
        Object.entries(parMotif)
          .map(([k, n]) => `${k}: ${n}`)
          .join(", ")
    );
    for (const b of attribues.slice(0, 3)) {
      const a = b.amendement!;
      console.log(
        `   alinéa ${b.index + 1} → amendement n° ${a.numero} (${a.auteur.nom}, ${a.auteur.groupe || "groupe inconnu"})` +
          ` · visé « ${a.alinea ?? "?"} » · ${b.versionLabel}`
      );
    }

    // Mode détaillé : de quoi comprendre les non-attributions plutôt que de les
    // subir — numéros attendus d'un côté, numéros réellement cités de l'autre.
    if (process.argv.includes("--detail")) {
      console.log(
        `   versions : ${detail.versionsTexte
          .map((v) => `${v.label}${texteEstPartiel(v.alineas) ? " [partiel]" : ""}`)
          .join(" | ")}`
      );
      const adoptes = detail.historique.filter((a) => a.statut === "Adopté");
      console.log(
        `   ${adoptes.length} amendements adoptés — alinéas cités : ${
          adoptes
            .map((a) => `${a.numero}:${a.alinea ?? "—"}@${(a.dateSortIso ?? "").slice(0, 10)}`)
            .join(", ") || "aucun"
        }`
      );
      console.log(
        `   numéros attendus par alinéa : ${blame
          .map((b) => `${b.index + 1}→${b.numeroVise ?? "?"}`)
          .join(" ")}`
      );
    }
  }

  console.log(
    `\nTotal : ${totalAttribues}/${totalAlineas} alinéas attribués à un amendement précis ` +
      `(${totalAlineas ? Math.round((100 * totalAttribues) / totalAlineas) : 0} %). ` +
      `Les autres portent l'attribution — exacte — à une version du texte.`
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
