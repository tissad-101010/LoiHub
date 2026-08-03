"use client";
import { useEffect, useMemo, useState } from "react";
import type { VersionArticle } from "@/lib/types";
import { diffLines } from "@/lib/diff";
import { texteEstPartiel } from "@/lib/ui";
import TexteDiff from "./TexteDiff";

// Comparaison de DEUX versions au choix d'un article, façon « comparer des
// révisions » : l'utilisateur pilote l'avant et l'après au lieu de subir une
// comparaison figée entre la première et la dernière version.
//
// Les textes de séance (qui ne reproduisent que les parties modifiées, avec des
// marqueurs « (Non modifiée) ») sont marqués comme tels et écartés des choix par
// défaut : les comparer à un texte complet ferait croire à une suppression
// massive. Ils restent sélectionnables manuellement, avec un avertissement.
export default function EvolutionTexte({ versions }: { versions: VersionArticle[] }) {
  const completes = useMemo(
    () => versions.map((v, i) => ({ v, i })).filter(({ v }) => !texteEstPartiel(v.alineas)),
    [versions]
  );

  // Défaut : le dernier couple de versions complètes qui diffèrent réellement
  // (une navette re-dépose souvent un texte identique -> diff vide, sans intérêt).
  const defauts = useMemo(() => {
    for (let k = completes.length - 1; k > 0; k--) {
      const apres = completes[k];
      for (let j = k - 1; j >= 0; j--) {
        const avant = completes[j];
        if (avant.v.alineas.join("\n") !== apres.v.alineas.join("\n")) {
          return { avant: avant.i, apres: apres.i };
        }
      }
    }
    return completes.length >= 2
      ? { avant: completes[0].i, apres: completes[completes.length - 1].i }
      : null;
  }, [completes]);

  const [avant, setAvant] = useState(defauts?.avant ?? 0);
  const [apres, setApres] = useState(defauts?.apres ?? 0);

  // L'article affiché change -> on repart des versions par défaut du nouvel article.
  useEffect(() => {
    setAvant(defauts?.avant ?? 0);
    setApres(defauts?.apres ?? 0);
  }, [defauts]);

  if (versions.length < 2 || !defauts) {
    return (
      <section className="border border-bordure bg-white p-5">
        <h2 className="titre text-xl text-encre">Évolution du texte</h2>
        <p className="mt-2 text-sm text-gris">
          {versions.length === 0
            ? "L'Assemblée nationale n'a pas publié de version articulée de ce texte : il n'y a rien à comparer."
            : "Une seule version de cet article est publiée : aucune comparaison possible pour l'instant."}
        </p>
      </section>
    );
  }

  const vAvant = versions[avant];
  const vApres = versions[apres];
  const partiel = texteEstPartiel(vAvant?.alineas) || texteEstPartiel(vApres?.alineas);
  const diff = vAvant && vApres ? diffLines(vAvant.alineas, vApres.alineas) : [];
  // Aucun alinéa en commun = les deux versions ne parlent probablement pas du
  // même article : la numérotation change au fil de la navette, et l'« article
  // 54 » du texte déposé n'est pas forcément celui du texte adopté. On le dit,
  // plutôt que de présenter une comparaison sans valeur comme un diff.
  const sansRecouvrement =
    diff.length > 0 && !diff.some((l) => l.type === "inchange") && avant !== apres;

  const option = (v: VersionArticle, i: number) => (
    <option key={`${i}-${v.label}`} value={i}>
      {v.label}
      {texteEstPartiel(v.alineas) ? " — texte partiel" : ""}
    </option>
  );

  return (
    <section className="border border-bordure bg-white p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="titre text-xl text-encre">Évolution du texte</h2>
        <span className="ref-mono text-xs text-gris">
          {versions.length} version{versions.length > 1 ? "s" : ""} publiée
          {versions.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-xs text-gris">
          Comparer
          <select
            value={avant}
            onChange={(e) => setAvant(Number(e.target.value))}
            className="mt-1 block w-full border border-bordure bg-white px-2 py-1.5 text-sm text-encre"
          >
            {versions.map(option)}
          </select>
        </label>
        <span aria-hidden className="pb-2 text-gris">
          →
        </span>
        <label className="min-w-0 flex-1 text-xs text-gris">
          avec
          <select
            value={apres}
            onChange={(e) => setApres(Number(e.target.value))}
            className="mt-1 block w-full border border-bordure bg-white px-2 py-1.5 text-sm text-encre"
          >
            {versions.map(option)}
          </select>
        </label>
      </div>

      {partiel && (
        <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          L&apos;une des versions choisies est un texte de séance : il ne reproduit que les parties
          modifiées (« (Non modifiée) », « (Supprimé) »). La comparaison exagère donc l&apos;ampleur
          des changements.
        </p>
      )}

      {sansRecouvrement && (
        <p className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Ces deux versions n&apos;ont aucun alinéa en commun. La numérotation des articles change au
          fil de la navette : il s&apos;agit probablement de <strong>deux articles différents</strong>{" "}
          portant le même numéro, et non de l&apos;évolution d&apos;un même article. À interpréter
          avec prudence.
        </p>
      )}

      <TexteDiff diff={diff} info={{ avant: vAvant.label, apres: vApres.label }} />
    </section>
  );
}
