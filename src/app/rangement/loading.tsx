import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function RangementLoading() {
  return (
    <div className="container mx-auto px-4 max-w-5xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-40 rounded bg-amber-200/50 animate-pulse mb-1" />
          <div className="h-4 w-72 rounded bg-amber-100/40 animate-pulse" />
        </div>
        <div className="h-10 w-44 rounded bg-amber-200/30 animate-pulse" />
      </div>

      {/* Furniture card skeletons */}
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="border-amber-200 mb-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="h-6 w-48 rounded bg-amber-200/40 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 w-36 rounded bg-amber-100/30 animate-pulse" />
                <div className="h-8 w-24 rounded bg-amber-100/30 animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-40 rounded bg-amber-50/40 animate-pulse" />
          </CardContent>
        </Card>
      ))}

      <p className="text-center text-sm text-muted-foreground mt-8 animate-pulse">
        Chargement…
      </p>
    </div>
  );
}
