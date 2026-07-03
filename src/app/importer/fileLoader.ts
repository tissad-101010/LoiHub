import fs from "node:fs";
import path from "node:path";

function safeParse(filePath: string): unknown | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8").trim();

    if (!raw) {
      console.warn("⚠️ Empty JSON file skipped:", filePath);
      return null;
    }

    const parsed = JSON.parse(raw);
    console.log("✅ JSON loaded:", filePath);
    return parsed;
  } catch (error) {
    console.error("❌ Invalid JSON:", filePath);
    return null;
  }
}

export function loadFolderSmart(inputPath: string): unknown[] {
  const absolute = path.resolve(process.cwd(), inputPath);

  console.log("📂 Loading folder:", absolute);

  if (!fs.existsSync(absolute)) {
    console.warn("⚠️ Path does not exist:", absolute);
    return [];
  }

  function scan(currentPath: string): unknown[] {
    const stat = fs.statSync(currentPath);

    if (stat.isFile()) {
      if (!currentPath.endsWith(".json")) {
        console.log("⏭️ Non-JSON file skipped:", currentPath);
        return [];
      }

      const parsed = safeParse(currentPath);
      return parsed ? [parsed] : [];
    }

    console.log("📁 Scanning directory:", currentPath);

    const results: unknown[] = [];

    for (const entry of fs.readdirSync(currentPath)) {
      const full = path.join(currentPath, entry);
      results.push(...scan(full));
    }

    return results;
  }

  const results = scan(absolute);

  console.log("✅ Total JSON files loaded:", results.length);

  return results;
}