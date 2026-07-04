// Affiché instantanément pendant que la page loi (Server Component) charge ses
// données. Permet à la transition (next-transition-router) de se terminer tout
// de suite au lieu de rester bloquée sur l'overlay.
export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-5 p-6">
        {/* en-tête loi */}
        <div className="h-40 animate-pulse rounded-2xl bg-slate-800/90" />
        {/* stats */}
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-gray-100" />
          ))}
        </div>
        {/* parcours */}
        <div className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-gray-100" />
        {/* corps */}
        <div className="h-96 animate-pulse rounded-2xl border border-gray-200 bg-gray-100" />
        <p className="text-center text-sm text-gray-400">Chargement du dossier…</p>
      </div>
    </div>
  );
}
