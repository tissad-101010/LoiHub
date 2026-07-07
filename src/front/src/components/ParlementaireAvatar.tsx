"use client";

import { useState } from "react";
import type { Depute } from "@/lib/types";

function initials(nom: string) {
  const parts = nom
    .replace(/^Réf\.\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);

  return (parts[0]?.[0] ?? "?") + (parts[parts.length - 1]?.[0] ?? "");
}

export default function ParlementaireAvatar({
  depute,
  size = "md",
}: {
  depute: Depute;
  size?: "sm" | "md";
}) {
  const [failed, setFailed] = useState(false);
  const classes = size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs";

  if (depute.photoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- External official portraits are tiny, dynamic, and already optimized by the institution.
      <img
        src={depute.photoUrl}
        alt={`Portrait of ${depute.nom}`}
        title={`${depute.nom}${depute.id !== "?" ? ` · ${depute.id}` : ""}`}
        className={`${classes} shrink-0 rounded-full object-cover ring-1 ring-gray-200`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={`${classes} flex shrink-0 items-center justify-center rounded-full bg-gray-200 font-medium text-gris ring-1 ring-gray-200`}
      title={depute.id !== "?" ? depute.id : depute.nom}
    >
      {initials(depute.nom)}
    </span>
  );
}
