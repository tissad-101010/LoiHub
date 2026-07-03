function cleanText(value: unknown): string {
  if (!value) return "";

  if (typeof value === "string") {
    return value
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return "";
}

function mapStatus(rawSort: unknown) {
  const value = JSON.stringify(rawSort ?? "").toLowerCase();

  if (value.includes("adopt")) return "ACCEPTED";
  if (value.includes("rejet")) return "REJECTED";
  if (value.includes("irrecev")) return "REJECTED";

  return "PENDING";
}

function parseDate(value: unknown) {
  if (!value) return null;
  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseAmendment(raw: unknown) {
  const a = (raw as any)?.amendement;
  if (!a?.uid) return null;

  const ident = a.identification ?? {};
  const signataire = a.signataires?.auteur;

  const content =
    cleanText(a.corps?.contenuAuteur?.dispositif) ||
    cleanText(a.corps?.dispositif) ||
    cleanText(a.corps?.contenuAuteur?.exposeSommaire) ||
    "";

  return {
    uid: String(a.uid),

    numeroLong: ident.numeroLong ?? null,
    numeroOrdreDepot: ident.numeroOrdreDepot ?? null,
    prefixeOrganeExamen: ident.prefixeOrganeExamen ?? null,

    examenRef: a.examenRef ?? null,
    texteLegislatifRef: a.texteLegislatifRef ?? null,

    article:
      a.pointeurFragmentTexte?.division?.articleDesignationCourte ??
      a.pointeurFragmentTexte?.division?.titre ??
      null,

    alinea:
      a.pointeurFragmentTexte?.amendementStandard?.alinea?.alineaDesignation ??
      null,

    title: ident.numeroLong ?? String(a.uid),
    content,

    status: mapStatus(a.sort),
    sort: typeof a.sort === "string" ? a.sort : JSON.stringify(a.sort ?? null),

    dateDepot: parseDate(a.dateDepot),
    datePublication: parseDate(a.datePublication),
    dateSort: parseDate(a.sort?.dateSort),

    authorId: signataire?.acteurRef ?? null,
    lawRef: a.texteLegislatifRef ?? null,

    rawJson: a,
  };
}