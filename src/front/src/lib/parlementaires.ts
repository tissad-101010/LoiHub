export type ParlementaireInfo = {
  id: string;
  nom?: string;
  photoUrl?: string;
  source?: "assemblee" | "senat";
};

const ASSEMBLEE_PHOTO_BASE =
  "https://www2.assemblee-nationale.fr/static/tribun/17/photos";

export function photoParlementaireUrl(id: string): string | undefined {
  if (/^PA\d+$/.test(id)) {
    return `${ASSEMBLEE_PHOTO_BASE}/${id.slice(2)}.jpg`;
  }

  return undefined;
}

export async function getInfoParlementaireOfficielle(
  id: string,
): Promise<ParlementaireInfo> {
  const info: ParlementaireInfo = {
    id,
    photoUrl: photoParlementaireUrl(id),
    source: /^PA\d+$/.test(id) ? "assemblee" : undefined,
  };

  if (!/^PA\d+$/.test(id)) return info;

  try {
    const res = await fetch(
      `https://www.assemblee-nationale.fr/dyn/deputes/${id}`,
      {
        next: { revalidate: 60 * 60 * 24 * 7 },
      },
    );
    if (!res.ok) return info;

    const html = await res.text();
    const title = html.match(/<title>([^<]+)/i)?.[1]?.trim();
    const nom = title
      ?.split(" - ")[0]
      ?.replace(/^(M\.|Mme|Mmes|MM\.)\s+/i, "")
      ?.trim();

    if (nom) info.nom = nom;
  } catch {
    // Keep the computed portrait URL even when the profile page cannot be reached.
  }

  return info;
}
