"use client";

// Filet de sécurité ultime : ne s'affiche que si le layout racine lui-même
// plante (error.tsx ne peut alors pas s'afficher). Doit rendre <html>/<body>.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <main
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "4rem 1.5rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", color: "#161616" }}>
            Une erreur est survenue
          </h1>
          <p style={{ color: "#666" }}>
            LoiHub a rencontré un problème inattendu. Veuillez réessayer.
          </p>
          {error.digest && (
            <p style={{ fontFamily: "monospace", fontSize: 12, color: "#bbb" }}>
              réf. {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              background: "#000091",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "0.5rem 1rem",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
