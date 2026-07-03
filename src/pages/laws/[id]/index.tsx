// pages/law/[id]/index.tsx

import { fetchLaw, fetchAmendments } from "@/lib/api";

export default async function LawPage({ params }) {
  const law = await fetchLaw(params.id);
  const amendments = await fetchAmendments(params.id);

  return (
    <div className="space-y-6">

      <LawHeader law={law} />

      <div className="grid grid-cols-3 gap-4">

        <div className="col-span-2">
          <AmendmentFeed amendments={amendments} />
        </div>

        <div>
          <LawMeta law={law} />
        </div>

      </div>
    </div>
  );
}