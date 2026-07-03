// pages/laws/index.tsx

import { fetchLaws } from "@/lib/api";

export default async function LawsPage() {
  const laws = await fetchLaws();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Lois</h2>

      <div className="grid grid-cols-3 gap-4">
        {laws.map((law) => (
          <LawCard key={law.uid} law={law} />
        ))}
      </div>
    </div>
  );
}