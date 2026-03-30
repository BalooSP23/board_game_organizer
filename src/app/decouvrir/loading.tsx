import { Card } from "@/components/ui/card";

export default function DecouvrirLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="h-8 w-64 rounded bg-teal-200/50 animate-pulse mb-2" />
      <div className="h-5 w-96 rounded bg-teal-100/40 animate-pulse mb-6" />

      <div className="h-10 w-80 rounded bg-teal-100/30 animate-pulse mb-6" />

      {/* Results grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-video bg-teal-50/50 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-teal-200/40 animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-teal-100/30 animate-pulse" />
              <div className="h-8 w-full rounded bg-teal-100/20 animate-pulse mt-2" />
            </div>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8 animate-pulse">
        Chargement…
      </p>
    </div>
  );
}
