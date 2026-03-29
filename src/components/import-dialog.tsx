"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BggSearchResult {
  bggId: number;
  name: string;
  yearPublished?: number;
}

export function ImportDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BggSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery(q);
    setError(null);
    setSuccessId(null);

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
      setSuccessId(bggId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'import");
    } finally {
      setImportingId(null);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setError(null);
      setSuccessId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importer un jeu depuis BGG</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Rechercher sur BGG..."
            value={query}
            onChange={(e) => search(e.target.value)}
            autoFocus
          />

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {searching && (
            <p className="text-sm text-muted-foreground">Recherche en cours...</p>
          )}

          {results.length > 0 && (
            <ul className="max-h-80 overflow-y-auto divide-y divide-border rounded-md border">
              {results.map((r) => (
                <li
                  key={r.bggId}
                  className="flex items-center justify-between gap-2 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.name}</p>
                    {r.yearPublished && (
                      <p className="text-xs text-muted-foreground">
                        {r.yearPublished}
                      </p>
                    )}
                  </div>
                  {successId === r.bggId ? (
                    <span className="text-xs text-success font-medium shrink-0">
                      ✓ Importé
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={importingId !== null}
                      onClick={() => handleImport(r.bggId)}
                      className="shrink-0"
                    >
                      {importingId === r.bggId ? "Import..." : "Importer"}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!searching && query.length >= 2 && results.length === 0 && !error && (
            <p className="text-sm text-muted-foreground">
              Aucun résultat trouvé
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
