// Affiché instantanément pendant que la page loi (Server Component) charge ses
// données (squelette de chargement).
export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-5 p-6">
        {/* en-tête loi */}
        <div className="h-40 animate-pulse bg-bleu/90" />
        {/* stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse border border-bordure bg-fond-alt" />
          ))}
        </div>
        {/* parcours */}
        <div className="h-32 animate-pulse border border-bordure bg-fond-alt" />
        {/* corps */}
        <div className="h-96 animate-pulse border border-bordure bg-fond-alt" />
        <p className="text-center text-sm text-gris">Chargement du dossier…</p>
      </div>
    </div>
  );
}
