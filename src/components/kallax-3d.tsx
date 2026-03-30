"use client";

import { useMemo } from "react";
import {
  CELL_PX,
  DEPTH_PX,
  WALL_PX,
  COLORS,
  cellPosition,
  furnitureDimensions,
  shelfYOffset,
  gameBoxPx,
} from "@/lib/kallax-render";

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

export interface PlacedGame {
  placementId: string;
  gameId: string;
  gameName: string;
  thumbnailUrl?: string | null;
  cellId: string;
  shelfId?: string | null;
  position: number;
  orientation: "front" | "side";
  boxWidth: number | null;
  boxHeight: number | null;
}

interface Kallax3DProps {
  furniture: Furniture;
  placements?: PlacedGame[];
  selectedPlacementId?: string | null;
  highlightedCellIds?: string[];
  onGameClick?: (placementId: string) => void;
  onCellClick?: (cellId: string) => void;
}

export function Kallax3D({
  furniture,
  placements = [],
  selectedPlacementId,
  highlightedCellIds = [],
  onGameClick,
  onCellClick,
}: Kallax3DProps) {
  const { rows, cols, cells } = furniture;
  const dims = useMemo(() => furnitureDimensions(rows, cols), [rows, cols]);

  const cellMap = useMemo(() => {
    const m = new Map<string, Cell>();
    for (const c of cells) m.set(`${c.row}-${c.col}`, c);
    return m;
  }, [cells]);

  // Group placements by cellId
  const placementsByCell = useMemo(() => {
    const m = new Map<string, PlacedGame[]>();
    for (const p of placements) {
      const list = m.get(p.cellId) || [];
      list.push(p);
      m.set(p.cellId, list);
    }
    // Sort each cell's placements by position
    for (const list of m.values()) list.sort((a, b) => a.position - b.position);
    return m;
  }, [placements]);

  const maxW = 600;
  const scale = Math.min(1, maxW / (dims.width + DEPTH_PX + 20));

  return (
    <div className="flex flex-col items-center gap-2">
      <h3 className="text-sm font-medium text-amber-800">
        Aperçu 2.5D — {furniture.name}
      </h3>
      <div style={{ perspective: "800px", perspectiveOrigin: "50% 40%" }}>
        <div
          style={{
            transform: `scale(${scale}) rotateX(8deg) rotateY(-12deg)`,
            transformOrigin: "center center",
            position: "relative",
            width: dims.width,
            height: dims.height,
            transition: "transform 0.4s ease",
          }}
        >
          {/* Back face */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: COLORS.frameInner,
              borderRadius: 4,
              boxShadow: "4px 4px 12px rgba(0,0,0,0.25)",
            }}
          />

          {/* Top face */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: -DEPTH_PX,
              width: dims.width,
              height: DEPTH_PX,
              backgroundColor: COLORS.cellTop,
              transform: "skewX(-45deg)",
              transformOrigin: "bottom left",
              borderRadius: "2px 2px 0 0",
            }}
          />

          {/* Right side face */}
          <div
            style={{
              position: "absolute",
              right: -DEPTH_PX,
              top: -DEPTH_PX,
              width: DEPTH_PX,
              height: dims.height,
              backgroundColor: COLORS.cellSide,
              transform: "skewY(-45deg)",
              transformOrigin: "top left",
              borderRadius: "0 2px 2px 0",
            }}
          />

          {/* Cells */}
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const cell = cellMap.get(`${r}-${c}`);
              if (!cell) return null;
              const pos = cellPosition(r, c);
              const cellPlacements = placementsByCell.get(cell.id) || [];
              const isHighlighted = highlightedCellIds.includes(cell.id);
              return (
                <CellBox
                  key={cell.id}
                  cell={cell}
                  x={pos.x}
                  y={pos.y}
                  placements={cellPlacements}
                  selectedPlacementId={selectedPlacementId}
                  isHighlighted={isHighlighted}
                  onGameClick={onGameClick}
                  onCellClick={onCellClick}
                />
              );
            })
          )}

          {/* Frame grid lines — horizontal */}
          {Array.from({ length: rows + 1 }).map((_, i) => (
            <div
              key={`h-${i}`}
              style={{
                position: "absolute",
                left: 0,
                top: i * (CELL_PX + WALL_PX),
                width: dims.width,
                height: WALL_PX,
                backgroundColor: COLORS.frameOuter,
              }}
            />
          ))}

          {/* Frame grid lines — vertical */}
          {Array.from({ length: cols + 1 }).map((_, i) => (
            <div
              key={`v-${i}`}
              style={{
                position: "absolute",
                left: i * (CELL_PX + WALL_PX),
                top: 0,
                width: WALL_PX,
                height: dims.height,
                backgroundColor: COLORS.frameOuter,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CellBox({
  cell,
  x,
  y,
  placements,
  selectedPlacementId,
  isHighlighted,
  onGameClick,
  onCellClick,
}: {
  cell: Cell;
  x: number;
  y: number;
  placements: PlacedGame[];
  selectedPlacementId?: string | null;
  isHighlighted: boolean;
  onGameClick?: (placementId: string) => void;
  onCellClick?: (cellId: string) => void;
}) {
  const bg = isHighlighted
    ? "#BBF7D0"
    : cell.hasLaxRax
    ? COLORS.laxRaxBg
    : COLORS.cellBg;
  const shelves = cell.hasLaxRax ? cell.shelves : [];

  return (
    <div
      onClick={(e) => {
        // If clicking on the cell background (not a game), trigger cell click
        if (onCellClick && isHighlighted) {
          e.stopPropagation();
          onCellClick(cell.id);
        }
      }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: CELL_PX,
        height: CELL_PX,
        backgroundColor: bg,
        transition: "background-color 0.3s ease",
        overflow: "hidden",
        cursor: isHighlighted ? "pointer" : "default",
        border: isHighlighted ? "2px solid #22C55E" : "none",
        boxSizing: "border-box",
      }}
    >
      {/* Depth shadow inset */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.15)",
          pointerEvents: "none",
        }}
      />

      {/* Shelves */}
      {shelves.map((shelf, idx) => {
        const yOff = shelfYOffset(idx, shelves.length);
        return (
          <div
            key={shelf.id ?? idx}
            style={{
              position: "absolute",
              left: 2,
              right: 2,
              top: yOff - 1.5,
              height: 3,
              backgroundColor: COLORS.shelfColor,
              borderRadius: 1,
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              transition: "top 0.3s ease",
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Placed games — stacked from bottom */}
      {placements.map((p) => {
        const dims =
          p.boxWidth && p.boxHeight
            ? gameBoxPx(
                p.orientation === "front" ? p.boxWidth : (p.boxHeight ?? p.boxWidth),
                p.boxHeight ?? 10
              )
            : { w: CELL_PX - 8, h: 20 };
        const isSelected = selectedPlacementId === p.placementId;
        // Stack from bottom: each game at bottom offset
        const bottomOffset = p.position * (dims.h + 2);
        return (
          <div
            key={p.placementId}
            onClick={(e) => {
              e.stopPropagation();
              onGameClick?.(p.placementId);
            }}
            title={p.gameName}
            style={{
              position: "absolute",
              bottom: bottomOffset + 2,
              left: Math.max(2, (CELL_PX - dims.w) / 2),
              width: Math.min(dims.w, CELL_PX - 4),
              height: Math.min(dims.h, CELL_PX - 4),
              backgroundImage: p.thumbnailUrl ? `url(${p.thumbnailUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: p.thumbnailUrl ? undefined : "#D4A574",
              borderRadius: 2,
              border: isSelected ? "2px solid #2563EB" : "1px solid rgba(0,0,0,0.2)",
              boxShadow: isSelected
                ? "0 0 6px rgba(37,99,235,0.5)"
                : "0 1px 2px rgba(0,0,0,0.15)",
              cursor: onGameClick ? "pointer" : "default",
              overflow: "hidden",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              fontSize: 6,
              color: "white",
              textShadow: "0 0 2px black",
              lineHeight: 1.1,
              padding: "0 1px 1px",
            }}
          >
            {!p.thumbnailUrl && (
              <span style={{ fontSize: 7, textAlign: "center" }}>
                {p.gameName.slice(0, 12)}
              </span>
            )}
          </div>
        );
      })}

      {/* Lax Rax label */}
      {cell.hasLaxRax && shelves.length === 0 && placements.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 8,
            color: "#0D9488",
            fontWeight: 600,
            opacity: 0.6,
          }}
        >
          LR
        </div>
      )}
    </div>
  );
}
