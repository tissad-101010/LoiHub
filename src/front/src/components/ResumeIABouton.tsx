"use client";
import { useEffect, useState } from "react";

// Bouton « Résumer l'article » : n'appelle l'API (donc Mistral) qu'au clic.
// Une fois le résumé obtenu, il est conservé dans le state — recliquer ne
// relance aucune requête (anti-flood côté client).

type Etat = "idle" | "loading" | "done" | "error";

export default function ResumeIABouton({ texte }: { texte: string }) {
  const [etat, setEtat] = useState<Etat>("idle");
  const [resume, setResume] = useState<string>("");
  const [erreur, setErreur] = useState<string>("");

  // changement d'article -> on repart de zéro
  useEffect(() => {
    setEtat("idle");
    setResume("");
    setErreur("");
  }, [texte]);

  async function resumer() {
    if (etat === "loading" || etat === "done") return; // déjà en cours / déjà fait
    setEtat("loading");
    setErreur("");
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Erreur ${res.status}`);
      setResume(data.resume);
      setEtat("done");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
      setEtat("error");
    }
  }

  return (
    <div className="mb-4">
      {etat !== "done" && (
        <button
          type="button"
          onClick={resumer}
          disabled={etat === "loading"}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {etat === "loading" ? "Résumé en cours…" : "Résumer l'article (IA)"}
        </button>
      )}

      {etat === "error" && (
        <p className="mt-2 text-sm text-red-600">
          Impossible de générer le résumé : {erreur}{" "}
          <button type="button" onClick={resumer} className="underline">
            Réessayer
          </button>
        </p>
      )}

      {etat === "done" && (
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="mb-1 text-sm font-medium text-slate-900">
            Résumé de l&apos;article par IA
          </div>
          <p className="whitespace-pre-line text-sm text-slate-700">{resume}</p>
          <p className="mt-2 text-xs text-slate-400">Généré par Mistral — peut contenir des imprécisions.</p>
        </div>
      )}
    </div>
  );
}
