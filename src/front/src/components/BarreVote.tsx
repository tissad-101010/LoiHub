import type { Scrutin } from "@/lib/types";

// Résultat d'un scrutin public en une barre : pour / contre / abstention, à
// l'échelle des voix réellement exprimées. Partagé par la fiche loi, la carte
// « Origine de cette modification » et le registre des scrutins.
// Une motion de censure ne fait pas l'objet d'un décompte « pour / contre » :
// l'article 49 alinéa 2 de la Constitution prévoit que « seuls sont recensés les
// votes favorables à la motion de censure ». La barre affiche alors 100 % de
// vert sur un scrutin rejeté, ce qui se lit comme une erreur — d'où cette note.
// On ne la montre que quand les deux conditions factuelles sont réunies :
// intitulé de motion de censure ET aucune voix contre/abstention enregistrée.
const estMotionCensure = (titre: string) => /motion de censure/i.test(titre);

export default function BarreVote({
  scrutin,
  legende = false,
}: {
  scrutin: Scrutin;
  legende?: boolean;
}) {
  const total = scrutin.pour + scrutin.contre + scrutin.abstention || 1;
  const seg = (n: number) => `${(n / total) * 100}%`;
  const recensementPartiel =
    scrutin.contre === 0 && scrutin.abstention === 0 && estMotionCensure(scrutin.titre);

  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-fond-alt">
        <div style={{ width: seg(scrutin.pour) }} className="bg-green-500" title={`Pour : ${scrutin.pour}`} />
        <div style={{ width: seg(scrutin.contre) }} className="bg-red-500" title={`Contre : ${scrutin.contre}`} />
        <div
          style={{ width: seg(scrutin.abstention) }}
          className="bg-gray-400"
          title={`Abstention : ${scrutin.abstention}`}
        />
      </div>
      {legende && (
        <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-gris">
          <span>
            <span className="ref-mono font-medium text-green-700">{scrutin.pour}</span> pour
          </span>
          <span>
            <span className="ref-mono font-medium text-red-700">{scrutin.contre}</span> contre
          </span>
          <span>
            <span className="ref-mono font-medium text-gris">{scrutin.abstention}</span> abstention
          </span>
        </div>
      )}
      {legende && recensementPartiel && (
        <p className="mt-1 text-xs text-gris">
          Motion de censure : seuls les votes favorables sont recensés (Constitution, art. 49
          al. 2). La barre ne représente donc pas un rapport de force.
        </p>
      )}
    </div>
  );
}
