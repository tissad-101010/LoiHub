// components/law/LawCard.tsx

export function LawCard({ law }) {
  return (
    <div className="bg-[#111827] border border-gray-800 p-4 rounded-xl hover:border-blue-500 transition">

      <h3 className="font-bold text-lg">{law.title}</h3>

      <div className="text-sm text-gray-400 mt-2">
        {law.type} • Législature {law.legislature}
      </div>

      <div className="mt-4 flex gap-2">
        <a href={`/law/${law.uid}`} className="text-blue-400">
          Ouvrir
        </a>
        <a href={`/dossier/${law.uid}`} className="text-gray-400">
          Timeline
        </a>
      </div>
    </div>
  );
}