import {
  importDeputies,
  importLaws,
  importDossiers,
  importAmendments,
} from "./importer.service";

async function main() {
  console.log("🚀 LoiHub Import Starting...");

  await importDeputies();
  await importLaws();
  await importDossiers();
  await importAmendments();

  console.log("🎉 Import finished successfully");
}

main();