import { NextRequest, NextResponse } from "next/server";
import { getGameDetails } from "@/lib/bgg";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  let body: { bggId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { bggId } = body;
  if (!bggId || typeof bggId !== "number") {
    return NextResponse.json({ error: "Missing or invalid 'bggId' (number)" }, { status: 400 });
  }

  // Check if already imported
  const existing = await prisma.game.findUnique({ where: { bggId } });
  if (existing) {
    return NextResponse.json(existing);
  }

  try {
    const details = await getGameDetails(bggId);

    const game = await prisma.game.create({
      data: {
        bggId: details.bggId,
        name: details.name,
        description: details.description,
        thumbnailUrl: details.thumbnailUrl,
        imageUrl: details.imageUrl,
        minPlayers: details.minPlayers,
        maxPlayers: details.maxPlayers,
        playingTime: details.playingTime,
        minPlayingTime: details.minPlayingTime,
        yearPublished: details.yearPublished,
        rating: details.rating,
        weight: details.weight,
        categories: details.categories,
        mechanics: details.mechanics,
        boxWidth: details.boxWidth,
        boxHeight: details.boxHeight,
        boxDepth: details.boxDepth,
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("queued") ? 202 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
