"use client";
import { useState } from "react";

// « Une question sur cette loi ? » — Q&R citoyenne alimentée par l'IA (Mistral),
// strictement bornée aux données du dossier (voir /api/question). Une question
// à la fois, à la demande : aucun appel tant que l'utilisateur n'envoie rien.

const SUGGESTIONS = [
  "Que change ce texte concrètement ?",
  "Où en est ce texte dans son parcours ?",
  "Quels groupes ont le plus amendé ce texte ?",
];

type Etat = "idle" | "loading" | "done" | "error" | "off";

export default function QuestionLoi({ dossierUid }: { dossierUid: string }) {
  const [question, setQuestion] = useState("");
  const [posee, setPosee] = useState("");
  const [reponse, setReponse] = useState("");
  const [erreur, setErreur] = useState("");
  const [etat, setEtat] = useState<Etat>("idle");

  async function poser(q: string) {
    const propre = q.trim();
    if (propre.length < 5 || etat === "loading") return;
    setEtat("loading");
    setPosee(propre);
    setErreur("");
    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossier: dossierUid, question: propre }),
      });
      const data = await res.json();
      if (res.status === 503) {
        setEtat("off"); // pas de clé IA sur ce déploiement -> on masque le bloc
        return;
      }
      if (!res.ok) throw new Error(data?.error ?? `Erreur ${res.status}`);
      setReponse(data.reponse);
      setEtat("done");
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
      setEtat("error");
    }
  }

  if (etat === "off") return null;

  return (
    <div className="border border-bordure bg-white p-5">
      <div className="mb-1 flex items-center gap-2">
        <span aria-hidden>💬</span>
        <h2 className="titre text-xl text-encre">Une question sur ce texte ?</h2>
      </div>
      <p className="mb-4 text-xs text-gris">
        L&apos;IA répond uniquement à partir des données officielles de ce dossier. Si
        l&apos;information n&apos;y figure pas, elle vous le dira.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          poser(question);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={500}
          placeholder="Ex : que change ce texte concrètement ?"
          aria-label="Votre question sur ce texte"
          className="flex-1 border border-bordure bg-white px-3 py-2 text-sm text-encre placeholder:text-gris focus:border-bleu focus:outline-none"
        />
        <button
          type="submit"
          disabled={etat === "loading" || question.trim().length < 5}
          className="shrink-0 bg-bleu px-4 py-2 text-sm font-medium text-white transition hover:bg-bleu-survol disabled:cursor-not-allowed disabled:opacity-50"
        >
          {etat === "loading" ? "Recherche…" : "Poser la question"}
        </button>
      </form>

      {etat === "idle" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQuestion(s);
                poser(s);
              }}
              className="rounded-full border border-bordure px-3 py-1 text-xs text-gris transition hover:border-bleu hover:text-bleu"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {etat === "error" && (
        <p className="mt-3 text-sm text-red-600">
          Impossible d&apos;obtenir une réponse : {erreur}{" "}
          <button type="button" onClick={() => poser(posee)} className="underline">
            Réessayer
          </button>
        </p>
      )}

      {etat === "done" && (
        <div className="mt-4 rounded-lg bg-bleu-100 p-4">
          <div className="mb-1 text-xs font-medium text-gris">Votre question : {posee}</div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-encre">{reponse}</p>
          <p className="mt-2 text-xs text-gris">
            Réponse générée par IA (Mistral) à partir des données du dossier — peut contenir des
            imprécisions ; le dossier officiel de l&apos;Assemblée nationale fait foi.
          </p>
          <button
            type="button"
            onClick={() => {
              setEtat("idle");
              setQuestion("");
              setReponse("");
            }}
            className="mt-2 text-xs font-medium text-bleu hover:underline"
          >
            Poser une autre question
          </button>
        </div>
      )}
    </div>
  );
}
