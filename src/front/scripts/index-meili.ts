// Indexation Meilisearch — lancée automatiquement au `make up` (service `indexer`
// du docker-compose) et à la demande via `make index`.
//
// Lit la base Postgres (Prisma) et pousse 3 collections dans Meilisearch :
//   - dossiers    (2 900+ dossiers législatifs, cherchables par titre)
//   - amendements (121k, cherchables par numéro / auteur / article / extrait)
//   - deputes     (577 parlementaires, cherchables par nom / groupe)
//
// Idempotent : on peut le relancer, les documents sont remplacés par `id`.

import { PrismaClient } from "../src/generated/prisma";
import {
  meili,
  ensureIndex,
  INDEX,
  type DossierDoc,
  type AmendementDoc,
  type DeputeDoc,
} from "../src/lib/meili";

const prisma = new PrismaClient();

// ------ helpers (repris de lib/data.ts, en version autonome) ------

function stripHtml(html: unknown): string {
  if (typeof html !== "string") return "";
  return html
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&laquo;|&#171;/gi, "«")
    .replace(/&raquo;|&#187;/gi, "»")
    .replace(/\s+/g, " ")
    .trim();
}

function statutLabel(status: string, sort: string | null): string {
  if (status === "ACCEPTED") return "Adopté";
  if (status === "REJECTED") return "Rejeté";
  const s = (sort || "").toLowerCase();
  if (s.includes("retir")) return "Retiré";
  if (s.includes("tomb")) return "Tombé";
  if (s.includes("non soutenu")) return "Non soutenu";
  return "En discussion";
}

const BATCH = 5000;

async function addInBatches<T extends Record<string, any>>(uid: string, docs: T[]) {
  for (let i = 0; i < docs.length; i += BATCH) {
    const slice = docs.slice(i, i + BATCH);
    await meili.index<T>(uid).addDocuments(slice).waitTask({ timeout: 120_000 });
    process.stdout.write(`  ${uid}: ${Math.min(i + BATCH, docs.length)}/${docs.length}\r`);
  }
  if (docs.length) process.stdout.write("\n");
}

// ---------------------------- Députés ----------------------------

async function indexDeputes() {
  console.log("• Députés…");
  await ensureIndex(INDEX.deputes);
  const rows = await prisma.deputy.findMany({
    select: { uid: true, name: true, group: true },
  });
  const docs: DeputeDoc[] = rows
    .filter((d) => d.uid)
    .map((d) => ({ id: d.uid as string, nom: d.name, groupe: d.group }));
  await addInBatches(INDEX.deputes, docs);
  console.log(`  ${docs.length} députés indexés.`);
}

// ---------------------------- Dossiers ---------------------------

async function indexDossiers() {
  console.log("• Dossiers…");
  await ensureIndex(INDEX.dossiers);
  const rows = await prisma.$queryRaw<
    { uid: string; titre: string | null; n: bigint; adoptes: bigint }[]
  >`
    SELECT d."uid" AS uid, d."title" AS titre,
           COUNT(a.id) AS n,
           COUNT(a.id) FILTER (WHERE a."status" = 'ACCEPTED') AS adoptes
    FROM "Dossier" d
    LEFT JOIN "Law" l ON l."dossierId" = d.id
    LEFT JOIN "Amendment" a ON a."lawId" = l.id
    WHERE d."uid" IS NOT NULL AND d."title" IS NOT NULL
    GROUP BY d."uid", d."title"
  `;
  const docs: DossierDoc[] = rows.map((r) => ({
    id: r.uid,
    titre: r.titre as string,
    amendements: Number(r.n),
    adoptes: Number(r.adoptes),
  }));
  await addInBatches(INDEX.dossiers, docs);
  console.log(`  ${docs.length} dossiers indexés.`);
}

// -------------------------- Amendements --------------------------

async function indexAmendements() {
  console.log("• Amendements…");
  await ensureIndex(INDEX.amendements);

  // Résolution auteur (uid -> nom) et dossier (lawId -> uid/titre) en mémoire :
  // 577 députés + quelques milliers de dossiers, largement tenable.
  const deputes = new Map<string, string>();
  for (const d of await prisma.deputy.findMany({ select: { uid: true, name: true } })) {
    if (d.uid) deputes.set(d.uid, d.name);
  }

  const dossierParLaw = new Map<string, { uid: string | null; titre: string | null }>();
  for (const l of await prisma.law.findMany({
    select: { id: true, dossier: { select: { uid: true, title: true } } },
  })) {
    dossierParLaw.set(l.id, { uid: l.dossier?.uid ?? null, titre: l.dossier?.title ?? null });
  }

  // Curseur : on stream les 121k amendements par pages pour ne pas tout charger d'un coup.
  const PAGE = 5000;
  let cursor: string | undefined;
  let total = 0;

  for (;;) {
    const rows = await prisma.amendment.findMany({
      take: PAGE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      select: {
        id: true,
        uid: true,
        numeroLong: true,
        numeroOrdreDepot: true,
        article: true,
        content: true,
        status: true,
        sort: true,
        authorId: true,
        lawId: true,
      },
    });
    if (rows.length === 0) break;
    cursor = rows[rows.length - 1].id;

    const docs: AmendementDoc[] = rows.map((a) => {
      const dossier = a.lawId ? dossierParLaw.get(a.lawId) : undefined;
      const extrait = stripHtml(a.content);
      return {
        id: a.uid,
        numero: a.numeroLong ?? a.numeroOrdreDepot ?? "?",
        article: a.article,
        extrait: extrait.length > 600 ? extrait.slice(0, 600) + "…" : extrait,
        statut: statutLabel(a.status, a.sort),
        auteur: a.authorId ? deputes.get(a.authorId) ?? null : null,
        dossierUid: dossier?.uid ?? null,
        dossierTitre: dossier?.titre ?? null,
      };
    });

    await meili.index<AmendementDoc>(INDEX.amendements).addDocuments(docs).waitTask({ timeout: 180_000 });
    total += rows.length;
    process.stdout.write(`  amendements: ${total} indexés\r`);
  }
  process.stdout.write("\n");
  console.log(`  ${total} amendements indexés.`);
}

// ------------------------------ main -----------------------------

// Postgres redémarre brièvement après la restauration du dump (init) : le
// healthcheck peut passer juste avant ce redémarrage. On attend donc que la
// base accepte réellement les requêtes avant d'indexer (fiabilise `make up`).
async function attendreBase(essais = 30) {
  for (let i = 1; i <= essais; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return;
    } catch {
      console.log(`  base pas encore prête (${i}/${essais})…`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("Base de données injoignable après plusieurs tentatives.");
}

async function main() {
  const t0 = Date.now();
  console.log(`Indexation Meilisearch -> ${process.env.MEILI_HOST ?? "http://localhost:7700"}`);
  await meili.health(); // échoue vite si le serveur n'est pas joignable
  await attendreBase();

  await indexDeputes();
  await indexDossiers();
  await indexAmendements();

  console.log(`✓ Terminé en ${Math.round((Date.now() - t0) / 1000)}s`);
}

main()
  .catch((e) => {
    console.error("✗ Indexation échouée :", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
