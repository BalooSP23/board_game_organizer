"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KallaxSizePicker } from "@/components/kallax-size-picker";
import { FurnitureConfig } from "@/components/furniture-config";
import { Kallax3D, type PlacedGame } from "@/components/kallax-3d";
import { KALLAX_SIZES } from "@/lib/kallax";

type KallaxSize = (typeof KALLAX_SIZES)[number];

interface Shelf {
  id: string;
  position: number;
  heightCm: number;
  spacingMm: number;
}

interface Cell {
  id: string;
  row: number;
  col: number;
  hasLaxRax: boolean;
  shelves: Shelf[];
}

interface Furniture {
  id: string;
  name: string;
  rows: number;
  cols: number;
  cells: Cell[];
}

interface Game {
  id: string;
  name: string;
  thumbnailUrl?: string | null;
  boxWidth: number | null;
  boxHeight: number | null;
  boxDepth: number | null;
}

interface PlacementRecord {
  id: string;
  gameId: string;
  cellId: string;
  shelfId?: string | null;
  position: number;
  orientation: "front" | "side";
  game: Game;
  cell: { furnitureId: string };
}

export default function RangementPage() {
  const [furnitureList, setFurnitureList] = useState<Furniture[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [placements, setPlacements] = useState<PlacementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedSize, setSelectedSize] = useState<KallaxSize | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [autoPlacing, setAutoPlacing] = useState(false);

  // Click-to-move state machine: idle | selected
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const [furRes, plRes, gRes] = await Promise.all([
      fetch("/api/furniture"),
      fetch("/api/placement"),
      fetch("/api/games"),
    ]);
    setFurnitureList(await furRes.json());
    setPlacements(await plRes.json());
    setAllGames(await gRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Derive placed games for a given furniture
  function placedGamesForFurniture(furnitureId: string): PlacedGame[] {
    return placements
      .filter((p) => p.cell.furnitureId === furnitureId)
      .map((p) => ({
        placementId: p.id,
        gameId: p.gameId,
        gameName: p.game.name,
        thumbnailUrl: p.game.thumbnailUrl,
        cellId: p.cellId,
        shelfId: p.shelfId,
        position: p.position,
        orientation: p.orientation,
        boxWidth: p.game.boxWidth,
        boxHeight: p.game.boxHeight,
      }));
  }

  // Unplaced games: games not in any placement, or games missing dimensions
  const placedGameIds = new Set(placements.map((p) => p.gameId));
  const unplacedGames = allGames.filter((g) => !placedGameIds.has(g.id));

  // Highlighted cells: all cells on the selected game's furniture (valid destinations)
  function highlightedCellIds(furnitureId: string): string[] {
    if (!selectedPlacementId || selectedFurnitureId !== furnitureId) return [];
    const f = furnitureList.find((f) => f.id === furnitureId);
    if (!f) return [];
    return f.cells.map((c) => c.id);
  }

  function handleGameClick(placementId: string, furnitureId: string) {
    if (selectedPlacementId === placementId) {
      // Deselect
      setSelectedPlacementId(null);
      setSelectedFurnitureId(null);
    } else {
      setSelectedPlacementId(placementId);
      setSelectedFurnitureId(furnitureId);
    }
  }

  async function handleCellClick(cellId: string) {
    if (!selectedPlacementId) return;
    // Move the selected game to this cell
    await fetch(`/api/placement/${selectedPlacementId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cellId, position: 0 }),
    });
    setSelectedPlacementId(null);
    setSelectedFurnitureId(null);
    fetchAll();
  }

  async function handleAutoPlace(furnitureId: string) {
    setAutoPlacing(true);
    const gameIds = allGames.map((g) => g.id);
    await fetch("/api/placement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameIds, furnitureId }),
    });
    await fetchAll();
    setAutoPlacing(false);
  }

  async function handleCreate() {
    if (!newName.trim() || !selectedSize) return;
    setCreating(true);
    await fetch("/api/furniture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        rows: selectedSize.rows,
        cols: selectedSize.cols,
      }),
    });
    setCreating(false);
    setDialogOpen(false);
    setNewName("");
    setSelectedSize(null);
    fetchAll();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/furniture/${id}`, { method: "DELETE" });
    if (editingId === id) setEditingId(null);
    fetchAll();
  }

  return (
    <main className="container mx-auto px-4 max-w-5xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Rangement</h1>
          <p className="text-gray-600 text-sm">
            Configurez vos meubles Kallax et inserts Lax Rax
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              + Ajouter un meuble
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nouveau meuble Kallax</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium">Nom du meuble</label>
                <Input
                  placeholder="ex. Kallax salon"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Taille</label>
                <div className="mt-2">
                  <KallaxSizePicker
                    selected={selectedSize}
                    onSelect={setSelectedSize}
                  />
                </div>
              </div>
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || !selectedSize || creating}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                {creating ? "Création…" : "Créer le meuble"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading && (
        <p className="text-gray-500 text-center py-12">Chargement…</p>
      )}

      {!loading && furnitureList.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-2">🗄️</p>
          <p>Aucun meuble configuré.</p>
          <p className="text-sm">
            Cliquez sur « Ajouter un meuble » pour commencer.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {furnitureList.map((f) => (
          <Card key={f.id} className="border-amber-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-amber-900">
                  {f.name}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    ({f.rows}×{f.cols})
                  </span>
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAutoPlace(f.id)}
                    disabled={autoPlacing}
                  >
                    {autoPlacing ? "Placement…" : "Placement automatique"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setEditingId(editingId === f.id ? null : f.id)
                    }
                  >
                    {editingId === f.id ? "Fermer" : "Configurer"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(f.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </CardHeader>
            {editingId === f.id && (
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FurnitureConfig furniture={f} onUpdate={fetchAll} />
                  <Kallax3D
                    furniture={f}
                    placements={placedGamesForFurniture(f.id)}
                    selectedPlacementId={selectedPlacementId}
                    highlightedCellIds={highlightedCellIds(f.id)}
                    onGameClick={(pid) => handleGameClick(pid, f.id)}
                    onCellClick={handleCellClick}
                  />
                </div>
              </CardContent>
            )}
            {editingId !== f.id && (
              <CardContent className="pt-0">
                <Kallax3D
                  furniture={f}
                  placements={placedGamesForFurniture(f.id)}
                  selectedPlacementId={selectedPlacementId}
                  highlightedCellIds={highlightedCellIds(f.id)}
                  onGameClick={(pid) => handleGameClick(pid, f.id)}
                  onCellClick={handleCellClick}
                />
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Jeux non placés */}
      {!loading && unplacedGames.length > 0 && (
        <Card className="mt-6 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-800 text-lg">
              Jeux non placés ({unplacedGames.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {unplacedGames.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-2 p-2 rounded bg-orange-50 border border-orange-100"
                >
                  {g.thumbnailUrl ? (
                    <img
                      src={g.thumbnailUrl}
                      alt={g.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-orange-200 flex items-center justify-center text-xs">
                      🎲
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{g.name}</p>
                    {(g.boxWidth == null || g.boxHeight == null || g.boxDepth == null) && (
                      <p className="text-[10px] text-orange-600">Dimensions manquantes</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPlacementId && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-sm">
          Cliquez sur une case pour déplacer le jeu • <button onClick={() => { setSelectedPlacementId(null); setSelectedFurnitureId(null); }} className="underline">Annuler</button>
        </div>
      )}
    </main>
  );
}
