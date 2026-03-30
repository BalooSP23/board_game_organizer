import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const games = await prisma.game.findMany({
    select: {
      id: true,
      name: true,
      thumbnailUrl: true,
      boxWidth: true,
      boxHeight: true,
      boxDepth: true,
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(games);
}
