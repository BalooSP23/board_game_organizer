import { Card } from "@/components/ui/card";

export default function CollectionLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-48 rounded bg-amber-200/50 animate-pulse" />
        <div className="h-10 w-36 rounded bg-amber-200/30 animate-pulse" />
      </div>

      {/* Collection value skeleton */}
      <div className="h-20 rounded-xl border bg-amber-50/30 animate-pulse mb-6" />

      {/* Card grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-[3/4] bg-amber-100/50 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 rounded bg-amber-200/40 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-teal-200/30 animate-pulse" />
            </div>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8 animate-pulse">
        Chargement de la collection…
      </p>
    </div>
  );
}
