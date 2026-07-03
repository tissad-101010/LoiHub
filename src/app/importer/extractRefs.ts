export function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function extractTextRefs(obj: unknown, acc = new Set<string>()) {
  if (!obj || typeof obj !== "object") return acc;

  if (Array.isArray(obj)) {
    for (const item of obj) extractTextRefs(item, acc);
    return acc;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (
      typeof value === "string" &&
      [
        "texteAssocie",
        "texteAdopte",
        "refTexteAssocie",
        "texteLegislatifRef",
      ].includes(key)
    ) {
      acc.add(value);
    }

    if (value && typeof value === "object") {
      extractTextRefs(value, acc);
    }
  }

  return acc;
}