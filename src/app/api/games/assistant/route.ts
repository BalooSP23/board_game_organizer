import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q");
  const players = params.get("players");
  const duration = params.get("duration");
  const category = params.get("category");
  const maxWeight = params.get("maxWeight");

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isWishlisted: false };

    if (q && q.trim().length >= 1) {
      where.name = { contains: q.trim(), mode: "insensitive" };
    }

    if (players) {
      const p = parseInt(players, 10);
      if (!isNaN(p)) {
        where.minPlayers = { lte: p };
        where.maxPlayers = { gte: p };
      }
    }

    if (duration) {
      const d = parseInt(duration, 10);
      if (!isNaN(d)) {
        where.playingTime = { lte: d };
      }
    }

    if (maxWeight) {
      const w = parseFloat(maxWeight);
      if (!isNaN(w)) {
        where.weight = { lte: w };
      }
    }

    // Fetch extra to allow post-query category filtering
    const categoryFilter = category?.trim() || null;

    let games = await prisma.game.findMany({
      where,
      select: {
        id: true,
        name: true,
        thumbnailUrl: true,
        rating: true,
        minPlayers: true,
        maxPlayers: true,
        playingTime: true,
        weight: true,
        categories: true,
      },
      orderBy: { rating: "desc" },
      take: categoryFilter ? 100 : 20,
    });

    if (categoryFilter) {
      const lower = categoryFilter.toLowerCase();
      games = games
        .filter((g) => {
          if (!Array.isArray(g.categories)) return false;
          return (g.categories as string[]).some(
            (c) => c.toLowerCase() === lower
          );
        })
        .slice(0, 20);
    }

    return NextResponse.json(games);
  } catch (error) {
    console.error("[assistant] Erreur recherche:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche assistant." },
      { status: 500 }
    );
  }
}
