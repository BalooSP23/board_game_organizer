"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container mx-auto px-4 max-w-5xl flex flex-col items-center justify-center py-24 text-center">
      <span className="text-6xl mb-6">⚠️</span>
      <h1 className="text-3xl font-bold text-amber-900 mb-2">
        Quelque chose s'est mal passé
      </h1>
      <p className="text-muted-foreground mb-8">
        Une erreur inattendue est survenue. Veuillez réessayer.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
      >
        🔄 Réessayer
      </button>
    </main>
  );
}
