"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Extension {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  fitsInParentBox: boolean;
}

interface SearchResult {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  parentGameId: string | null;
}

interface ExtensionManagerProps {
  gameId: string;
  initialExtensions: Extension[];
  parentGame: { id: string; name: string } | null;
}

export function ExtensionManager({
  gameId,
  initialExtensions,
  parentGame,
}: ExtensionManagerProps) {
  const [extensions, setExtensions] = useState<Extension[]>(initialExtensions);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const search = useCallback(
    async (q: string) => {
      setQuery(q);
      if (q.trim().length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(
          `/api/games/search?q=${encodeURIComponent(q.trim())}`
        );
        if (res.ok) {
          const data: SearchResult[] = await res.json();
          // Filter out self, already-linked extensions, and the parent
          const linked = new Set(extensions.map((e) => e.id));
          setResults(
            data.filter(
              (g) =>
                g.id !== gameId &&
                !linked.has(g.id) &&
                g.parentGameId === null
            )
          );
        }
      } finally {
        setSearching(false);
      }
    },
    [gameId, extensions]
  );

  async function linkExtension(extensionId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/games/${gameId}/extensions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extensionId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setExtensions([
          ...extensions,
          {
            id: updated.id,
            name: updated.name,
            thumbnailUrl: updated.thumbnailUrl,
            fitsInParentBox: updated.fitsInParentBox,
          },
        ]);
        setResults(results.filter((r) => r.id !== extensionId));
      }
    } finally {
      setSaving(false);
    }
  }

  async function unlinkExtension(extensionId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/games/${gameId}/extensions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extensionId }),
      });
      if (res.ok) {
        setExtensions(extensions.filter((e) => e.id !== extensionId));
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleFitsInBox(extensionId: string, current: boolean) {
    setSaving(true);
    try {
      const res = await fetch(`/api/games/${gameId}/extensions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extensionId, fitsInParentBox: !current }),
      });
      if (res.ok) {
        setExtensions(
          extensions.map((e) =>
            e.id === extensionId ? { ...e, fitsInParentBox: !current } : e
          )
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // If this game is an extension, don't show extension management
  if (parentGame) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Extension</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="border-amber-500 text-amber-700">
            Extension de{" "}
            <a
              href={`/games/${parentGame.id}`}
              className="underline ml-1 font-medium"
            >
              {parentGame.name}
            </a>
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Extensions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Linked extensions */}
        {extensions.length > 0 && (
          <ul className="space-y-2">
            {extensions.map((ext) => (
              <li
                key={ext.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <a
                    href={`/games/${ext.id}`}
                    className="font-medium hover:underline"
                  >
                    {ext.name}
                  </a>
                  <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ext.fitsInParentBox}
                      onChange={() =>
                        toggleFitsInBox(ext.id, ext.fitsInParentBox)
                      }
                      disabled={saving}
                      className="accent-teal-600"
                    />
                    Rentre dans la boîte
                  </label>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => unlinkExtension(ext.id)}
                  disabled={saving}
                  className="text-red-600 hover:text-red-700"
                >
                  Délier
                </Button>
              </li>
            ))}
          </ul>
        )}

        {/* Search to add extensions */}
        <div className="space-y-2">
          <Input
            placeholder="Rechercher un jeu à lier comme extension…"
            value={query}
            onChange={(e) => search(e.target.value)}
            className="h-8 text-sm"
          />
          {searching && (
            <p className="text-xs text-muted-foreground">Recherche…</p>
          )}
          {results.length > 0 && (
            <ul className="space-y-1 max-h-48 overflow-y-auto">
              {results.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between rounded-md border p-2 text-sm"
                >
                  <span>{g.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => linkExtension(g.id)}
                    disabled={saving}
                    className="border-teal-500 text-teal-700 hover:bg-teal-50"
                  >
                    Lier
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
