export function parseDeputy(raw: any) {
  // 🔥 cas 1: acteur
  const acteurUid = raw.acteur?.uid?.["#text"];
  if (acteurUid) {
    const ident = raw.acteur?.etatCivil?.ident;

    return {
      uid: acteurUid,
      name: ident ? `${ident.nom} ${ident.prenom}` : acteurUid,
      group: null,
      raw,
    };
  }

  // 🔥 cas 2: deport (ABSENCE / EVENT)
  const deportUid = raw.deport?.uid;
  const refActeur = raw.deport?.refActeur;

  if (deportUid && refActeur) {
    return {
      uid: deportUid, // ou refActeur selon ton modèle métier
      name: `deport-${refActeur}`,
      group: null,
      raw,
    };
  }

  // ❌ cas inconnu
  return null;
}