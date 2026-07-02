function extractTitle(value: any): string | null {
  if (!value) return null;

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return (
      value.libelleCourt ??
      value.nomCanonique ??
      value.titre ??
      null
    );
  }

  return null;
}

export function parseDossier(raw: any) {
  const d = raw?.dossierParlementaire;

  if (!d || typeof d !== "object") {
    console.warn("parseDossier: invalid dossierParlementaire field", raw);
    return null;
  }

  const id = d.uid || d.dossierRef;

  if (!id) {
    console.warn("parseDossier: missing id (uid or dossierRef)", raw);
    return null;
  }

  const title = extractTitle(d.titreDossier ?? d.titre);

  if (!title) {
    console.warn("parseDossier: missing title", raw);
    return null;
  }

  return {
    id,
    title,
    raw,
  };
}