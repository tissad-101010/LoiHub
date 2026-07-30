"use client";
import { useId, useRef, useState } from "react";
import { LEXIQUE, type TermeLexique } from "@/lib/lexique";

// Terme du lexique citoyen : souligné en pointillés, définition en langage
// simple affichée au survol (desktop) ou au clic/tap (mobile, clavier).
// Accessible : bouton focusable, aria-describedby, fermeture à Échap.

export default function Terme({
  mot,
  children,
}: {
  mot: TermeLexique;
  children?: React.ReactNode;
}) {
  const [ouvert, setOuvert] = useState(false);
  const id = useId();
  const fermetureRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const montrer = () => {
    if (fermetureRef.current) clearTimeout(fermetureRef.current);
    setOuvert(true);
  };
  // petit délai avant fermeture : laisse le temps d'amener le curseur sur la bulle
  const cacher = () => {
    fermetureRef.current = setTimeout(() => setOuvert(false), 150);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={montrer}
      onMouseLeave={cacher}
    >
      <button
        type="button"
        aria-expanded={ouvert}
        aria-describedby={ouvert ? id : undefined}
        onClick={() => setOuvert((v) => !v)}
        onFocus={montrer}
        onBlur={cacher}
        onKeyDown={(e) => e.key === "Escape" && setOuvert(false)}
        className="cursor-help rounded-sm underline decoration-bleu/40 decoration-dotted underline-offset-4 hover:decoration-bleu focus:outline-none focus-visible:ring-2 focus-visible:ring-bleu/40"
      >
        {children ?? mot}
      </button>
      {ouvert && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-72 max-w-[80vw] -translate-x-1/2 rounded-lg border border-bordure bg-white p-3 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-encre shadow-xl"
        >
          <span className="mb-1 block font-semibold capitalize text-bleu">{mot}</span>
          {LEXIQUE[mot]}
        </span>
      )}
    </span>
  );
}
