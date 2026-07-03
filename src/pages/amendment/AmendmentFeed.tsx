// components/amendment/AmendmentFeed.tsx


export function StatusBadge({ status }) {
  const map = {
    adopted: "bg-green-500",
    rejected: "bg-red-500",
    pending: "bg-gray-500",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded ${map[status]}`}>
      {status}
    </span>
  );
}

export function AmendmentFeed({ amendments }) {
  return (
    <div className="space-y-3">

      {amendments.map((a) => (
        <div
          key={a.id}
          className="bg-[#111827] border border-gray-800 p-4 rounded-lg"
        >

          <div className="flex justify-between">
            <span className="text-sm text-gray-400">
              Article {a.article}
            </span>

            <StatusBadge status={a.status} />
          </div>

          <p className="mt-2 text-sm">
            {a.content}
          </p>

        </div>
      ))}
    </div>
  );
}