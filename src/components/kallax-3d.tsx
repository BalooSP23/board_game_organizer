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

interface Kallax3DProps {
  furniture: Furniture;
}

export function Kallax3D({ furniture }: Kallax3DProps) {
  const { rows, cols, cells } = furniture;
  const dims = useMemo(() => furnitureDimensions(rows, cols), [rows, cols]);

  const cellMap = useMemo(() => {
    const m = new Map<string, Cell>();
    for (const c of cells) m.set(`${c.row}-${c.col}`, c);
    return m;
  }, [cells]);

  // Scale to fit container (max ~600px wide)
  const maxW = 600;
  const scale = Math.min(1, maxW / (dims.width + DEPTH_PX + 20));

  return (
    <div className="flex flex-col items-center gap-2">
      <h3 className="text-sm font-medium text-amber-800">
        Aperçu 2.5D — {furniture.name}
      </h3>
      <div
        style={{
          perspective: "800px",
          perspectiveOrigin: "50% 40%",
        }}
      >
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
              boxShadow: `4px 4px 12px rgba(0,0,0,0.25)`,
            }}
          />

          {/* Top face (parallelogram) */}
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
              return (
                <CellBox key={cell.id} cell={cell} x={pos.x} y={pos.y} />
              );
            })
          )}

          {/* Frame grid lines — horizontal */}
          {Array.from({ length: rows + 1 }).map((_, i) => {
            const y = i * (CELL_PX + WALL_PX);
            return (
              <div
                key={`h-${i}`}
                style={{
                  position: "absolute",
                  left: 0,
                  top: y,
                  width: dims.width,
                  height: WALL_PX,
                  backgroundColor: COLORS.frameOuter,
                }}
              />
            );
          })}

          {/* Frame grid lines — vertical */}
          {Array.from({ length: cols + 1 }).map((_, i) => {
            const x = i * (CELL_PX + WALL_PX);
            return (
              <div
                key={`v-${i}`}
                style={{
                  position: "absolute",
                  left: x,
                  top: 0,
                  width: WALL_PX,
                  height: dims.height,
                  backgroundColor: COLORS.frameOuter,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CellBox({ cell, x, y }: { cell: Cell; x: number; y: number }) {
  const bg = cell.hasLaxRax ? COLORS.laxRaxBg : COLORS.cellBg;
  const shelves = cell.hasLaxRax ? cell.shelves : [];

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: CELL_PX,
        height: CELL_PX,
        backgroundColor: bg,
        transition: "background-color 0.3s ease",
        overflow: "hidden",
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
            }}
          />
        );
      })}

      {/* Lax Rax label for small cells */}
      {cell.hasLaxRax && shelves.length === 0 && (
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
