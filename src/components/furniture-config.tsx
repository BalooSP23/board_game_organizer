"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VALID_SPACING_MM } from "@/lib/kallax";

interface Shelf {
  id?: string;
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

interface FurnitureConfigProps {
  furniture: Furniture;
  onUpdate: () => void;
}

export function FurnitureConfig({ furniture, onUpdate }: FurnitureConfigProps) {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [saving, setSaving] = useState(false);

  const cellMap = new Map<string, Cell>();
  for (const c of furniture.cells) {
    cellMap.set(`${c.row}-${c.col}`, c);
  }

  async function saveCell(cell: Cell, hasLaxRax: boolean, shelves: Shelf[]) {
    setSaving(true);
    try {
      await fetch(`/api/furniture/${furniture.id}/cells/${cell.id}/shelves`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasLaxRax, shelves }),
      });
      onUpdate();
      setSelectedCell(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Cliquez sur une case pour configurer les étagères Lax Rax
      </p>

      {/* Cell grid */}
      <div
        className="inline-grid gap-1 bg-amber-900/20 p-1 rounded-lg"
        style={{ gridTemplateColumns: `repeat(${furniture.cols}, 1fr)` }}
      >
        {Array.from({ length: furniture.rows }).map((_, r) =>
          Array.from({ length: furniture.cols }).map((_, c) => {
            const cell = cellMap.get(`${r}-${c}`);
            if (!cell) return null;
            const isSelected = selectedCell?.id === cell.id;
            return (
              <button
                key={cell.id}
                type="button"
                onClick={() => setSelectedCell(isSelected ? null : cell)}
                className={`w-16 h-16 rounded flex flex-col items-center justify-center text-xs transition-all ${
                  isSelected
                    ? "ring-2 ring-amber-600 bg-amber-100"
                    : cell.hasLaxRax
                      ? "bg-teal-100 hover:bg-teal-200"
                      : "bg-amber-50 hover:bg-amber-100"
                }`}
              >
                {cell.hasLaxRax && (
                  <>
                    <span className="text-teal-700 font-semibold text-[10px]">Lax Rax</span>
                    <span className="text-teal-600 text-[9px]">
                      {cell.shelves.length} étag.
                    </span>
                  </>
                )}
                {!cell.hasLaxRax && (
                  <span className="text-gray-400 text-[10px]">Vide</span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Cell editor */}
      {selectedCell && (
        <CellEditor
          cell={selectedCell}
          saving={saving}
          onSave={(hasLaxRax, shelves) => saveCell(selectedCell, hasLaxRax, shelves)}
          onCancel={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
}

function CellEditor({
  cell,
  saving,
  onSave,
  onCancel,
}: {
  cell: Cell;
  saving: boolean;
  onSave: (hasLaxRax: boolean, shelves: Shelf[]) => void;
  onCancel: () => void;
}) {
  const [hasLaxRax, setHasLaxRax] = useState(cell.hasLaxRax);
  const [shelves, setShelves] = useState<Shelf[]>(
    cell.shelves.length > 0
      ? cell.shelves
      : [{ position: 0, heightCm: 16, spacingMm: 0 }]
  );

  function addShelf() {
    setShelves((prev) => [
      ...prev,
      { position: prev.length, heightCm: 16, spacingMm: 0 },
    ]);
  }

  function removeShelf(idx: number) {
    setShelves((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateShelf(idx: number, field: keyof Shelf, value: number) {
    setShelves((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-amber-900">
          Case ({cell.row + 1}, {cell.col + 1})
        </h4>
        <Badge variant={hasLaxRax ? "default" : "secondary"}>
          {hasLaxRax ? "Lax Rax actif" : "Pas de Lax Rax"}
        </Badge>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={hasLaxRax}
          onChange={(e) => setHasLaxRax(e.target.checked)}
          className="rounded border-gray-300"
        />
        Activer Lax Rax dans cette case
      </label>

      {hasLaxRax && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Étagères</span>
            <Button type="button" variant="outline" size="sm" onClick={addShelf}>
              + Ajouter
            </Button>
          </div>
          {shelves.map((shelf, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded"
            >
              <span className="text-gray-500 w-6">#{idx + 1}</span>
              <label className="flex items-center gap-1">
                Haut.
                <input
                  type="number"
                  min={1}
                  max={33}
                  value={shelf.heightCm}
                  onChange={(e) =>
                    updateShelf(idx, "heightCm", Number(e.target.value))
                  }
                  className="w-14 border rounded px-1 py-0.5 text-center"
                />
                cm
              </label>
              <label className="flex items-center gap-1">
                Espacement
                <select
                  value={shelf.spacingMm}
                  onChange={(e) =>
                    updateShelf(idx, "spacingMm", Number(e.target.value))
                  }
                  className="border rounded px-1 py-0.5"
                >
                  {VALID_SPACING_MM.map((v) => (
                    <option key={v} value={v}>
                      {v} mm
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeShelf(idx)}
                className="text-red-500 ml-auto"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          onClick={() => onSave(hasLaxRax, hasLaxRax ? shelves : [])}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
}
