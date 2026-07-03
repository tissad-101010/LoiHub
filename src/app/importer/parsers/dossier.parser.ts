function extractTitle(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;

  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    return (
      (obj.titre as string | undefined) ??
      (obj.titreChemin as string | undefined) ??
      (obj.libelleCourt as string | undefined) ??
      (obj.nomCanonique as string | undefined) ??
      null
    );
  }

  return null;
}

export function parseDossier(raw: unknown) {
  const d = (raw as Record<string, unknown> | undefined)?.dossierParlementaire;
  if (!d || typeof d !== "object") return null;

  const dObj = d as Record<string, unknown>;
  const uid = dObj.uid ?? dObj.dossierRef ?? null;
  if (!uid) return null;

  const title = extractTitle(dObj.titreDossier ?? dObj.titre) ?? String(uid);

  return {
    uid: String(uid),
    title,
    raw,
  };
}