import fs from "node:fs";
import path from "node:path";

export function loadFolderSmart(inputPath: string): any[] {
  
  const absolute = path.resolve(process.cwd(), inputPath);

  function scan(dir: string): any[] {
    const stat = fs.statSync(dir);

    if (stat.isFile()) {
      return [JSON.parse(fs.readFileSync(dir, "utf-8"))];
    }

    const entries = fs.readdirSync(dir);
    const results: any[] = [];
    for (const entry of entries) {
      const full = path.join(dir, entry);
      const s = fs.statSync(full);
      if (s.isDirectory()) {
        results.push(...scan(full));
      } else if (entry.endsWith(".json")) {
        results.push(JSON.parse(fs.readFileSync(full, "utf-8")));
      }
      // exit when we have 1000 results to avoid memory issues
      if (results.length >= 1000) {
        console.warn("loadFolderSmart: reached 1000 results, stopping scan");
        break;
      }
    }

    return results;
  }

  return scan(absolute);
}