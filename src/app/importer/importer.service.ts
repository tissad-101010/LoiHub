import { prisma } from "../../lib/prisma";
import type { AmendmentStatus } from "@prisma/client";
import { loadFolderSmart as loadFolder } from "./fileLoader";

import { parseDeputy } from "./parsers/deputy.parser";
import { parseLaw } from "./parsers/law.parser";
import { parseDossier } from "./parsers/dossier.parser";
import { parseAmendment } from "./parsers/amendment.parser";

import path from "path";



export async function importDeputies() {
  const data = loadFolder(
    path.join("data", "AMO40_deputes_actifs_mandats_actifs_organes_divises.json")
  );

  for (const raw of data) {
    const d = parseDeputy(raw);
    if (!d) continue; // skip invalid/empty parse results

    await prisma.deputy.upsert({
      where: { uid: d.uid },
      update: { name: d.name, group: d.group === null ? undefined : d.group, raw: d.raw },
      create: { uid: d.uid, name: d.name, group: d.group, raw: d.raw },
    });
  }

  console.log("✅ Deputies imported");
}


export async function importLaws() {
  const data = loadFolder(
    path.join("data", "Dossiers_Legislatifs.json")
  );

  for (const raw of data) {
    const l = parseLaw(raw);
    if (!l) continue; // skip invalid/empty parse results
    if (!l.id) {
      console.warn("importLaws: law has no id, skipping", l);
      continue;
    }
    if (!l.title) { 
      console.warn("importLaws: law has no title, skipping", l);
      continue;
    }
    if (!l.description) {
      console.warn("importLaws: law has no description, skipping", l);
      continue;
    }
    if (!l.raw) {
      console.warn("importLaws: law has no raw data, skipping", l);
      continue;
    }
    if (!l.id || !l.title || !l.description || !l.raw) {
      console.warn("importLaws: law is missing required fields, skipping", l);
      continue;
    }
    await prisma.law.upsert({
      where: { externalId: l.id },
      update: {
        title: l.title,
        description: l.description,
        raw: l.raw,
      },
      create: {
        externalId: l.id,
        title: l.title,
        description: l.description,
        raw: l.raw,
      },
    });
    // await prisma.law.upsert({
    //   where: { id: l.id },
    //   update: { title: l.title, description: l.description, raw: l.raw },
    //   create: { id: l.id, title: l.title, description: l.description, raw: l.raw }, 
    // }); 
  }

  console.log("✅ Laws imported");
}


export async function importDossiers() {
  const data = loadFolder(
    path.join("data", "Dossiers_Legislatifs.json")
  );

  for (const raw of data) {
    const d = parseDossier(raw);
    if (!d) {
      console.warn("importDossiers: invalid dossier, skipping", raw);
      continue;
    }
    if (!d.id) {
      console.warn("importDossiers: dossier has no id, skipping", d);
      continue;
    }
    if (!d.title) {
      console.warn("importDossiers: dossier has no title, skipping", d);
      continue;
    }
    if (!d.raw) {
      console.warn("importDossiers: dossier has no raw data, skipping", d);
      continue;
    } 

    await prisma.dossier.upsert({
      where: { id: d.id },
      update: {},
      create: d,
    });
  }

  console.log("✅ Dossiers imported");
}


export async function importAmendments() {
  console.log("🚀 importAmendments: starting import");

  const data = loadFolder(path.join("data", "Amendements.json"));

  console.log("📦 loaded amendments:", data.length);

  // 🔥 1. laws preload
const laws = await prisma.law.findMany({
  select: {
    id: true,
    externalId: true,
  },
});

  console.log("📚 loaded laws:", laws.length);

  if (!laws || laws.length === 0) {
    console.warn("⚠️ importAmendments: no laws found, skipping import");
    return;
  }

  const lawMap = new Map(
  laws.map(l => [l.externalId, l.id])
);

  console.log("🧠 lawMap sample:", Array.from(lawMap).slice(0, 10));

  // 🔥 deputies preload
  const deputies = await prisma.deputy.findMany({
    select: { id: true },
  });

  const deputyMap = new Map(deputies.map(d => [d.id, d]));

  console.log("👥 loaded deputies:", deputies.length);

  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < data.length; i++) {
    const raw = data[i];

    if (i % 500 === 0) {
      console.log(`⏳ progress: ${i}/${data.length}`);
    }

    const a = parseAmendment(raw);

    if (!a) {
      skipped++;
      console.warn(`❌ parse failed at index ${i}`);
      continue;
    }

    const lawId = a.lawRef;

    const safeLawId = lawId && lawMap.has(lawId) ? lawMap.get(lawId) : null;
    const safeDeputyId =
      a.authorId && deputyMap.has(a.authorId) ? deputyMap.get(a.authorId)?.id : null;

    // 🔥 DEBUG ENTRY (CRUCIAL)
    if (!safeLawId) {
      console.warn("🧨 MISSING LAW MATCH", {
        uid: a.uid,
        rawLawRef: a.lawRef,
        authorId: a.authorId,
        sampleLawRef: Array.from(lawMap).slice(0, 3),
      });

      skipped++;
      continue;
    }

    // 🔍 log mapping OK
    console.log("✅ importing amendment", {
      uid: a.uid,
      lawRef: lawId,
      safeLawId,
      deputyId: safeDeputyId,
    });

    try {
      await prisma.amendment.upsert({
        where: { uid: a.uid },
        update: {
          lawId: safeLawId,
          deputyId: safeDeputyId,
          article: a.article,
          alinea: a.alinea,
          title: a.title,
          content: a.content,
          status: a.status as AmendmentStatus,
          rawJson: a.rawJson,
        },
        create: {
          uid: a.uid,
          lawId: safeLawId,
          deputyId: safeDeputyId,
          article: a.article,
          alinea: a.alinea,
          title: a.title,
          content: a.content,
          status: a.status as AmendmentStatus,
          rawJson: a.rawJson,
        },
      });

      imported++;
    } catch (e: unknown) {
      const error = e instanceof Error ? e : null;
      console.error("💥 UPSERT FAILED", {
        uid: a.uid,
        lawId: safeLawId,
        deputyId: safeDeputyId,
        message: error?.message,
        code: typeof e === "object" && e !== null && "code" in e ? (e as { code?: unknown }).code : undefined,
        meta: typeof e === "object" && e !== null && "meta" in e ? (e as { meta?: unknown }).meta : undefined,
      });

      skipped++;
    }
  }

  console.log("🏁 IMPORT DONE", {
    imported,
    skipped,
    total: data.length,
  });
}