import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 max-w-5xl flex flex-col items-center justify-center py-24 text-center">
      <span className="text-6xl mb-6">🎲</span>
      <h1 className="text-3xl font-bold text-amber-900 mb-2">
        Page introuvable
      </h1>
      <p className="text-muted-foreground mb-8">
        Désolé, cette page n'existe pas ou a été déplacée.
      </p>
      <Link
        href="/collection"
        className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
      >
        ← Retour à la collection
      </Link>
    </main>
  );
}
