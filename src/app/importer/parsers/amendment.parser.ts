export function parseAmendment(raw: any) {
  const a = raw?.amendement;
  if (!a?.uid) return null;

  const ident = a.identification ?? {};

  return {
    uid: a.uid,

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

    title: ident.numeroLong ?? null,

    content:
      a.corps?.contenuAuteur?.dispositif ??
      a.corps?.contenuAuteur?.exposeSommaire ??
      "",

    status: "PENDING",

    authorId: a.signataires?.auteur?.acteurRef ?? null,

    lawRef: a.texteLegislatifRef ?? null, // ⚠️ important
    rawJson: a,
  };
}