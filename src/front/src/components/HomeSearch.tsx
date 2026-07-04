"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SearchResponse } from "@/app/api/search/route";

const EXEMPLES = ["Loi immigration", "Réforme des retraites", "Loi climat"];

// Un « résultat plat » : on aplatit les 3 catégories en une seule liste pour la
// navigation clavier (flèches haut/bas), tout en gardant l'affichage groupé.
type Item =
  | { kind: "dossier"; href: string; titre: string; meta: string }
  | { kind: "amendement"; href: string; titre: string; meta: string; extrait: string }
  | { kind: "depute"; href: string; titre: string; meta: string };

function toItems(r: SearchResponse): Item[] {
  const items: Item[] = [];
  for (const d of r.dossiers) {
    items.push({
      kind: "dossier",
      href: `/loi/${encodeURIComponent(d.id)}`,
      titre: d.titre,
      meta: `${d.amendements.toLocaleString("fr-FR")} amendements · ${d.adoptes} adoptés`,
    });
  }
  for (const a of r.amendements) {
    items.push({
      kind: "amendement",
      href: a.dossierUid ? `/loi/${encodeURIComponent(a.dossierUid)}` : "#",
      titre: `Amendement ${a.numero}`,
      meta: [a.article, a.auteur, a.statut].filter(Boolean).join(" · "),
      extrait: a.extrait,
    });
  }
  for (const p of r.deputes) {
    items.push({
      kind: "depute",
      href: "#",
      titre: p.nom,
      meta: p.groupe ?? "Groupe inconnu",
    });
  }
  return items;
}

const GROUPES: { kind: Item["kind"]; label: string }[] = [
  { kind: "dossier", label: "Lois & dossiers" },
  { kind: "amendement", label: "Amendements" },
  { kind: "depute", label: "Députés" },
];

function Icone({ kind }: { kind: Item["kind"] }) {
  const common = "h-4 w-4 shrink-0";
  if (kind === "dossier")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${common} text-blue-500`}>
        <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" strokeLinejoin="round" />
      </svg>
    );
  if (kind === "amendement")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${common} text-orange-500`}>
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${common} text-emerald-500`}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 20c0-3.7 3.6-6.5 8-6.5s8 2.8 8 6.5" strokeLinecap="round" />
    </svg>
  );
}

export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1); // index survolé/sélectionné au clavier

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const seq = useRef(0); // anti-race : on ignore les réponses obsolètes

  // Debounce de la requête (200ms) + annulation des réponses périmées.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const mySeq = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data: SearchResponse = await res.json();
        if (mySeq !== seq.current) return; // une frappe plus récente a eu lieu
        setItems(toItems(data));
        setActive(-1);
      } catch {
        if (mySeq === seq.current) setItems([]);
      } finally {
        if (mySeq === seq.current) setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  // Fermeture au clic extérieur.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Raccourci ⌘K / Ctrl+K pour focus la recherche.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = useCallback(
    (item: Item) => {
      if (item.href === "#") return;
      setOpen(false);
      router.push(item.href);
    },
    [router]
  );

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && active < items.length) go(items[active]);
    }
  }

  const showDropdown = open && query.trim().length >= 2;
  const grouped = GROUPES.map((g) => ({
    ...g,
    entries: items.filter((it) => it.kind === g.kind),
  })).filter((g) => g.entries.length > 0);

  // On a besoin de l'index global (dans `items`) pour surligner au clavier.
  const indexOf = (item: Item) => items.indexOf(item);

  return (
    <div ref={rootRef} className="relative mx-auto max-w-2xl">
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 h-4 w-4 shrink-0 text-gray-400">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Rechercher une loi, un amendement, un député..."
          className="flex-1 bg-transparent px-1 py-1.5 text-sm text-slate-900 placeholder:text-gray-400 focus:outline-none"
          aria-label="Recherche"
          autoComplete="off"
        />
        {loading && (
          <svg className="h-4 w-4 shrink-0 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-20" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        <kbd className="mr-1 hidden shrink-0 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400 sm:block">
          ⌘K
        </kbd>
      </div>

      {/* Dropdown de résultats */}
      {showDropdown && (
        <div className="absolute z-50 mt-2 max-h-[70vh] w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 text-left shadow-xl">
          {!loading && grouped.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-gray-400">
              Aucun résultat pour « {query.trim()} »
            </div>
          )}

          {grouped.map((g) => (
            <div key={g.kind} className="mb-1 last:mb-0">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {g.label}
              </div>
              {g.entries.map((item, i) => {
                const gi = indexOf(item);
                const isActive = gi === active;
                return (
                  <button
                    key={`${g.kind}-${i}`}
                    type="button"
                    onMouseEnter={() => setActive(gi)}
                    onClick={() => go(item)}
                    disabled={item.href === "#"}
                    className={`flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition ${
                      isActive ? "bg-orange-50" : "hover:bg-gray-50"
                    } ${item.href === "#" ? "cursor-default opacity-70" : ""}`}
                  >
                    <span className="mt-0.5">
                      <Icone kind={item.kind} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">{item.titre}</span>
                      {item.meta && <span className="block truncate text-xs text-gray-500">{item.meta}</span>}
                      {item.kind === "amendement" && item.extrait && (
                        <span className="mt-0.5 block truncate text-xs text-gray-400">{item.extrait}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Exemples populaires (sous la barre, quand pas de dropdown) */}
      {!showDropdown && (
        <div className="mt-3 text-center text-xs text-gray-500">
          Exemples populaires :{" "}
          {EXEMPLES.map((ex, i) => (
            <span key={ex}>
              <button
                type="button"
                className="text-slate-900 hover:underline"
                onClick={() => {
                  setQuery(ex);
                  setOpen(true);
                  inputRef.current?.focus();
                }}
              >
                {ex}
              </button>
              {i < EXEMPLES.length - 1 && " · "}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
