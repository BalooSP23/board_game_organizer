import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoPlace } from "@/lib/placement";

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

export async function POST(request: Request) {
  const body = await request.json();
  const { gameIds, furnitureId } = body;

  if (!Array.isArray(gameIds) || !furnitureId) {
    return NextResponse.json(
      { error: "gameIds (array) and furnitureId required" },
      { status: 400 }
    );
  }

  const result = await autoPlace(gameIds, furnitureId);

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
    { placed: created, unplaceable: result.unplaceable },
    { status: 201 }
  );
}
