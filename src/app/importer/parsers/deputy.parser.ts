type DeputyRaw = {
  acteur?: {
    uid?: { '#text'?: string } | string;
    etatCivil?: {
      ident?: {
        nom?: string;
        prenom?: string;
      };
    };
  };
  deport?: {
    uid?: string | number;
    refActeur?: string | number;
  };
};

export function parseDeputy(raw: unknown) {
  const input = raw as DeputyRaw | null | undefined;
  const acteur = input?.acteur;
  const uid = typeof acteur?.uid === 'object' ? acteur.uid?.["#text"] : acteur?.uid;

  if (uid) {
    const ident = acteur?.etatCivil?.ident;

    const name = ident
      ? `${ident.nom ?? ""} ${ident.prenom ?? ""}`.trim()
      : String(uid);

    return {
      uid: String(uid),
      name,
      group: null,
      raw: input,
    };
  }

  const deport = input?.deport;

  if (deport?.uid && deport?.refActeur) {
    return {
      uid: String(deport.uid),
      name: `deport-${deport.refActeur}`,
      group: null,
      raw: input,
    };
  }

  return null;
}