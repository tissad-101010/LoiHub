export function extractUIDs(obj: any, acc: string[] = []) {
  if (!obj || typeof obj !== "object") return acc;

  for (const v of Object.values(obj)) {
    if (v && typeof v === "object") {
      if ("uid" in v && typeof v.uid === "string") acc.push(v.uid);
      extractUIDs(v, acc);
    }
  }

  return acc;
}