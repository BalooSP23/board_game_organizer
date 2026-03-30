import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeReorganization,
  type GameForPlacement,
  type CellForPlacement,
  type FurnitureForPlacement,
} from "@/lib/placement";

export async function POST(request: Request) {
  const body = await request.json();
  const { gameId, furnitureId } = body;

  if (!gameId || !furnitureId) {
    return NextResponse.json(
      { error: "gameId and furnitureId required" },
      { status: 400 }
    );
  }

  // Load furniture
  const f = await prisma.furniture.findUnique({
    where: { id: furnitureId },
    include: { cells: { include: { shelves: true } } },
  });
  if (!f) {
    return NextResponse.json({ error: "Furniture not found" }, { status: 404 });
  }

  const furniture: FurnitureForPlacement = {
    id: f.id,
    name: f.name,
    rows: f.rows,
    cols: f.cols,
    cells: f.cells.map((c): CellForPlacement => ({
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
    })),
  };

  // Load current placements for this furniture
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

  // Load all currently placed games + the new game
  const placedGameIds = existing.map((p) => p.gameId);
  const allGameIds = [...new Set([...placedGameIds, gameId])];
  const games = await prisma.game.findMany({ where: { id: { in: allGameIds } } });
  const gamesForPlacement: GameForPlacement[] = games.map((g) => ({
    id: g.id,
    name: g.name,
    boxWidth: g.boxWidth,
    boxHeight: g.boxHeight,
    boxDepth: g.boxDepth,
  }));

  const result = computeReorganization(currentPlacements, gamesForPlacement, furniture);

  // Enrich with game names for the frontend
  const gameMap = new Map(games.map((g) => [g.id, g.name]));
  const cellMap = new Map(f.cells.map((c) => [c.id, `R${c.row + 1}C${c.col + 1}`]));

  return NextResponse.json({
    moves: result.moves.map((m) => ({
      ...m,
      gameName: gameMap.get(m.gameId) ?? m.gameId,
      fromLabel: cellMap.get(m.from.cellId) ?? m.from.cellId,
      toLabel: cellMap.get(m.to.cellId) ?? m.to.cellId,
    })),
    added: result.added.map((a) => ({
      ...a,
      gameName: gameMap.get(a.gameId) ?? a.gameId,
      toLabel: cellMap.get(a.cellId) ?? a.cellId,
    })),
    placements: result.placements,
    unplaceable: result.unplaceable.map((u) => ({
      ...u,
      gameName: gameMap.get(u.gameId) ?? u.gameId,
    })),
  });
}
