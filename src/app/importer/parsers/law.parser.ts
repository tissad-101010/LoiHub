function safeJson(value: any) {
  try {
    return JSON.parse(
      JSON.stringify(value, (_, v) => {
        if (typeof v === "bigint") return v.toString();
        if (v instanceof Date) return v.toISOString();
        if (v === undefined) return null;
        return v;
      })
    );
  } catch (err) {
    console.warn("safeJson failed, fallback to string");
    return String(value);
  }
}

export function parseLaw(raw: any) {
  if (!raw) {
    throw new Error("parseLaw: raw is null or undefined");
  }

  const d = raw?.document;
  if (!d || typeof d !== "object") {
    console.warn("parseLaw: invalid document field", raw);
    return null;
  }

  // 🔎 extraction robuste des champs (API AN est incohérente)
  const id =
    d.id ??
    d.uid ??
    d["@uid"] ??
    d?.notice?.numNotice ??
    null;

  if (!id || typeof id !== "string") {
    console.warn("parseLaw: invalid or missing id (received: ${JSON.stringify(id)})", raw);
    return null;
  }

  // 📌 title fallback chain
  const title =
    d.title ??
    d.titres?.titrePrincipal ??
    d.titles?.main ??
    null;

  // 📌 description fallback chain
  const description =
    d.description ??
    d.titres?.titrePrincipalCourt ??
    d.notice?.formule ??
    null;

  // ❗ sécurité stricte minimum viable
  if (!title) {
    console.warn("parseLaw: missing title for law", id);
  }

  return {
    id: String(id).trim(),

    title: title ? String(title).trim() : "Untitled law",

    description: description ? String(description).trim() : null,

    // 🔒 toujours safe pour Prisma Json field
    raw: safeJson(raw),
  };
}