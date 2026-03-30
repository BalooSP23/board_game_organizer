"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface BggSearchResult {
  bggId: number;
  name: string;
  yearPublished?: number;
  thumbnailUrl?: string;
  minPlayers?: number;
  maxPlayers?: number;
}

export default function DecouvrirPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BggSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [successIds, setSuccessIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery(q);
    setError(null);

    if (q.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/bgg/search?q=${encodeURIComponent(q.trim())}`
        );
        if (!res.ok) throw new Error("Erreur de recherche");
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setError("Erreur lors de la recherche BGG");
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleImport = async (bggId: number) => {
    setImportingId(bggId);
    setError(null);
    try {
      const res = await fetch("/api/bgg/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bggId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Erreur lors de l'import");
      }
      setSuccessIds((prev) => new Set(prev).add(bggId));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'import");
    } finally {
      setImportingId(null);
    }
  };

  const playersLabel = (min?: number, max?: number) => {
    if (!min || !max) return null;
    return min === max
      ? `${min} joueur${min > 1 ? "s" : ""}`
      : `${min}-${max} joueurs`;
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-amber-900 mb-2">
        Découvrir de nouveaux jeux
      </h1>
      <p className="text-muted-foreground mb-6">
        Recherchez un jeu sur BoardGameGeek et ajoutez-le à votre collection.
      </p>

      <Input
        placeholder="Rechercher un jeu..."
        value={query}
        onChange={(e) => search(e.target.value)}
        className="max-w-md mb-6"
        autoFocus
      />

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {searching && (
        <p className="text-sm text-muted-foreground">Recherche en cours...</p>
      )}

      {!searching && query.length < 2 && results.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-lg">Recherchez un jeu pour commencer</p>
        </div>
      )}

      {!searching && query.length >= 2 && results.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">Aucun résultat trouvé</p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((r) => (
            <Card key={r.bggId} className="overflow-hidden h-full">
              <div className="relative aspect-video bg-muted">
                {r.thumbnailUrl ? (
                  <Image
                    src={r.thumbnailUrl}
                    alt={r.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-3xl">
                    🎲
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                  {r.name}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {r.yearPublished && <span>{r.yearPublished}</span>}
                  {playersLabel(r.minPlayers, r.maxPlayers) && (
                    <span>👥 {playersLabel(r.minPlayers, r.maxPlayers)}</span>
                  )}
                </div>
                {successIds.has(r.bggId) ? (
                  <span className="text-xs text-teal-600 font-medium">
                    ✓ Ajouté à la collection
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={importingId !== null}
                    onClick={() => handleImport(r.bggId)}
                    className="w-full border-teal-600 text-teal-700 hover:bg-teal-50"
                  >
                    {importingId === r.bggId
                      ? "Import..."
                      : "Ajouter à ma collection"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
