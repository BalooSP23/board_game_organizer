import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const games = await prisma.game.findMany({
      where: {
        name: { contains: q.trim(), mode: "insensitive" },
        isWishlisted: false,
      },
      select: {
        id: true,
        name: true,
        thumbnailUrl: true,
        parentGameId: true,
      },
      orderBy: { name: "asc" },
      take: 20,
    });

    return NextResponse.json(games);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la recherche." },
      { status: 500 }
    );
  }
}
