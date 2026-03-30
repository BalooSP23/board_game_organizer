import { Card } from "@/components/ui/card";

export default function GameDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back link skeleton */}
      <div className="h-4 w-40 rounded bg-amber-200/30 animate-pulse mb-6" />

      {/* Hero section */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Cover image placeholder */}
        <div className="shrink-0 w-64 h-80 rounded-lg bg-amber-100/50 animate-pulse" />

        {/* Title + info */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="h-9 w-2/3 rounded bg-amber-200/50 animate-pulse" />
            <div className="h-5 w-20 rounded bg-amber-200/30 animate-pulse" />
          </div>

          {/* Info tiles skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 rounded-lg border p-3"
              >
                <div className="h-5 w-5 rounded-full bg-teal-200/40 animate-pulse" />
                <div className="h-3 w-12 rounded bg-amber-200/30 animate-pulse" />
                <div className="h-4 w-8 rounded bg-amber-200/40 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description skeleton */}
      <Card className="mb-6">
        <div className="px-6 py-6 space-y-3">
          <div className="h-5 w-32 rounded bg-amber-200/40 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-amber-100/40 animate-pulse" />
            <div className="h-3 w-full rounded bg-amber-100/40 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-amber-100/40 animate-pulse" />
          </div>
        </div>
      </Card>

      <p className="text-center text-sm text-muted-foreground animate-pulse">
        Chargement des détails du jeu…
      </p>
    </div>
  );
}
