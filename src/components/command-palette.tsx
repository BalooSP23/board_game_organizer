"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Star } from "lucide-react";

interface GameResult {
  id: string;
  name: string;
  thumbnail: string | null;
  rating: number | null;
  minPlayers: number | null;
  maxPlayers: number | null;
  playingTime: number | null;
  categories: string[];
  weight: number | null;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (gameId: string) => void;
}

const DURATION_OPTIONS = [
  { label: "Toutes", value: "" },
  { label: "≤ 30 min", value: "30" },
  { label: "≤ 60 min", value: "60" },
  { label: "≤ 90 min", value: "90" },
  { label: "≤ 120 min", value: "120" },
];

const COMPLEXITY_OPTIONS = [
  { label: "Toutes", value: "" },
  { label: "Léger", value: "2" },
  { label: "Moyen", value: "3.5" },
  { label: "Complexe", value: "5" },
];

const CATEGORY_OPTIONS = [
  "Toutes",
  "Stratégie",
  "Famille",
  "Party Game",
  "Coopératif",
  "Gestion",
  "Placement d'ouvriers",
  "Deck Building",
  "Wargame",
  "Abstrait",
];

export function CommandPalette({ open, onOpenChange, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [complexity, setComplexity] = useState("");
  const [results, setResults] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setQuery("");
      setPlayers("");
      setDuration("");
      setCategory("Toutes");
      setComplexity("");
      setResults([]);
      setActiveIndex(0);
    }
  }, [open]);

  // Debounced fetch
  useEffect(() => {
    if (!open) return;

    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (players) params.set("players", players);
    if (duration) params.set("duration", duration);
    if (category && category !== "Toutes") params.set("category", category);
    if (complexity) params.set("maxWeight", complexity);

    // Need at least one filter
    if (params.toString() === "") {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/games/assistant?${params}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setResults(data);
            setActiveIndex(0);
          }
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [open, query, players, duration, category, complexity]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[activeIndex]) {
        e.preventDefault();
        onSelect(results[activeIndex].id);
        onOpenChange(false);
      }
    },
    [results, activeIndex, onSelect, onOpenChange]
  );

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const hasFilters = query || players || duration || (category && category !== "Toutes") || complexity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 gap-0 overflow-hidden rounded-xl border border-border/50 shadow-2xl backdrop-blur-sm [&>button]:hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search bar */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un jeu…"
            className="border-0 shadow-none focus-visible:ring-0 text-base h-auto p-0"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b px-4 py-2.5 text-sm bg-muted/30">
          <label className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Joueurs</span>
            <input
              type="number"
              min={1}
              max={20}
              value={players}
              onChange={(e) => setPlayers(e.target.value)}
              className="w-14 rounded-md border bg-background px-2 py-1 text-sm"
              placeholder="—"
            />
          </label>

          <label className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Durée max</span>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              {DURATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Catégorie</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Complexité</span>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              {COMPLEXITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {!hasFilters && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Commencez à taper ou utilisez les filtres pour chercher un jeu.
            </p>
          )}

          {hasFilters && !loading && results.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Aucun jeu trouvé
            </p>
          )}

          {results.map((game, i) => (
            <button
              key={game.id}
              onClick={() => {
                onSelect(game.id);
                onOpenChange(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/10 ${
                i === activeIndex ? "bg-accent/15" : ""
              }`}
            >
              {/* Thumbnail */}
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                {game.thumbnail ? (
                  <img
                    src={game.thumbnail}
                    alt={game.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">?</div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{game.name}</div>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  {game.rating != null && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-amber-600">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {game.rating.toFixed(1)}
                    </span>
                  )}
                  {(game.minPlayers != null || game.maxPlayers != null) && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {game.minPlayers === game.maxPlayers
                        ? `${game.minPlayers}J`
                        : `${game.minPlayers ?? "?"}–${game.maxPlayers ?? "?"}J`}
                    </Badge>
                  )}
                  {game.playingTime != null && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {game.playingTime} min
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center gap-3">
          <span><kbd className="rounded border px-1">↑↓</kbd> naviguer</span>
          <span><kbd className="rounded border px-1">↵</kbd> sélectionner</span>
          <span><kbd className="rounded border px-1">esc</kbd> fermer</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
