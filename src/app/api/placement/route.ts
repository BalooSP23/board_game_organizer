import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computePlacement,
  computeReorganization,
  type GameForPlacement,
  type FurnitureForPlacement,
  type CellForPlacement,
} from "@/lib/placement";

export async function GET() {
  const placements = await prisma.gamePlacement.findMany({
    include: {
      game: true,
      cell: { include: { furniture: true } },
      shelf: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(placements);
}

/** Fetch furniture with cells and shelves, mapped to algorithm types */
async function loadFurniture(furnitureId: string): Promise<FurnitureForPlacement | null> {
  const f = await prisma.furniture.findUnique({
    where: { id: furnitureId },
    include: { cells: { include: { shelves: true } } },
  });
  if (!f) return null;

  const cells: CellForPlacement[] = f.cells.map((c) => ({
    id: c.id,
    row: c.row,
    col: c.col,
    hasLaxRax: c.hasLaxRax,
    shelves: c.shelves.map((s) => ({
      id: s.id,
      position: s.position,
      heightCm: s.heightCm,
      spacingMm: s.spacingMm,
    })),
  }));

  return { id: f.id, name: f.name, rows: f.rows, cols: f.cols, cells };
}

/** Fetch games by IDs, mapped to algorithm types */
async function loadGames(gameIds: string[]): Promise<GameForPlacement[]> {
  const games = await prisma.game.findMany({ where: { id: { in: gameIds } } });
  return games.map((g) => ({
    id: g.id,
    name: g.name,
    boxWidth: g.boxWidth,
    boxHeight: g.boxHeight,
    boxDepth: g.boxDepth,
  }));
}

export async function POST(request: Request) {
  const body = await request.json();
  const { gameIds, furnitureId, mode } = body;

  if (!Array.isArray(gameIds) || !furnitureId) {
    return NextResponse.json(
      { error: "gameIds (array) and furnitureId required" },
      { status: 400 }
    );
  }

  const furniture = await loadFurniture(furnitureId);
  if (!furniture) {
    return NextResponse.json({ error: "Furniture not found" }, { status: 404 });
  }

  const games = await loadGames(gameIds);

  // Reorganization mode: include existing placements in the diff
  if (mode === "reorganize") {
    const existing = await prisma.gamePlacement.findMany({
      where: { cell: { furnitureId } },
    });
    const currentPlacements = existing.map((p) => ({
      gameId: p.gameId,
      cellId: p.cellId,
      shelfId: p.shelfId ?? undefined,
      position: p.position,
      orientation: p.orientation as "front" | "side",
    }));
    const result = computeReorganization(currentPlacements, games, furniture);
    return NextResponse.json(result, { status: 200 });
  }

  // Standard auto-placement
  const result = computePlacement(games, furniture);

  // Persist placed results
  const created = [];
  for (const p of result.placed) {
    const placement = await prisma.gamePlacement.upsert({
      where: { gameId: p.gameId },
      update: {
        cellId: p.cellId,
        shelfId: p.shelfId ?? null,
        position: p.position,
        orientation: p.orientation,
      },
      create: {
        gameId: p.gameId,
        cellId: p.cellId,
        shelfId: p.shelfId ?? null,
        position: p.position,
        orientation: p.orientation,
      },
    });
    created.push(placement);
  }

  return NextResponse.json(
    {
      placed: created,
      unplaceable: result.unplaceable,
    },
    { status: 201 }
  );
}
