import fs from "node:fs";
import path from "node:path";

function safeParse(filePath: string): unknown | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8").trim();

    if (!raw) return null;

    return JSON.parse(raw);
  } catch {
    console.error("❌ Invalid JSON:", filePath);
    return null;
  }
}

export function loadFolderSmart(inputPath: string): unknown[] {
  const absolute = path.resolve(process.cwd(), inputPath);

  function scan(dir: string): unknown[] {
    const stat = fs.statSync(dir);

    // 👉 sécurité : on ne parse QUE les fichiers JSON ici
    if (stat.isFile()) {
      if (!dir.endsWith(".json")) return [];

      const parsed = safeParse(dir);
      return parsed ? [parsed] : [];
    }

    const entries = fs.readdirSync(dir);
    const results: unknown[] = [];

    for (const entry of entries) {
      const full = path.join(dir, entry);
      const s = fs.statSync(full);

      if (s.isDirectory()) {
        results.push(...scan(full));
      } else if (entry.endsWith(".json")) {
        const parsed = safeParse(full);
        if (parsed) results.push(parsed);
      }

      // option anti-OOM (décommentable)
      // if (results.length >= 1000) break;
    }

    return results;
  }

  return scan(absolute);
}