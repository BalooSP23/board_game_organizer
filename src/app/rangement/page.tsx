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
import { Kallax3D } from "@/components/kallax-3d";
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

export default function RangementPage() {
  const [furnitureList, setFurnitureList] = useState<Furniture[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedSize, setSelectedSize] = useState<KallaxSize | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchFurniture = useCallback(async () => {
    const res = await fetch("/api/furniture");
    const data = await res.json();
    setFurnitureList(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFurniture();
  }, [fetchFurniture]);

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
    fetchFurniture();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/furniture/${id}`, { method: "DELETE" });
    if (editingId === id) setEditingId(null);
    fetchFurniture();
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
                  <FurnitureConfig furniture={f} onUpdate={fetchFurniture} />
                  <Kallax3D furniture={f} />
                </div>
              </CardContent>
            )}
            {editingId !== f.id && (
              <CardContent className="pt-0">
                <Kallax3D furniture={f} />
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </main>
  );
}
