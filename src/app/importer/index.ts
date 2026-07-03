import {
  importDeputies,
  importDossiers,
  importLaws,
  importAmendments,
  linkDossiersToLaws,
} from "./importer.service";

async function main() {
  console.log("🚀 LoiHub Import Starting...");

  await importDeputies();
  await importDossiers();
  await importLaws();
  await linkDossiersToLaws();
  await importAmendments();

  console.log("🎉 Import finished successfully");
}

main()
  .catch((error) => {
    console.error("💥 Import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../../lib/prisma");
    await prisma.$disconnect();
  });