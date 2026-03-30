import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: gameId } = await context.params;

  try {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json(
        { error: "Jeu introuvable." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { purchasePrice, purchaseDate } = body;

    const data: Record<string, unknown> = {};

    if (purchasePrice !== undefined) {
      data.purchasePrice = purchasePrice !== null ? Number(purchasePrice) : null;
    }

    if (purchaseDate !== undefined) {
      data.purchaseDate = purchaseDate !== null ? new Date(purchaseDate) : null;
    }

    const updated = await prisma.game.update({
      where: { id: gameId },
      data,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du prix d'achat." },
      { status: 500 }
    );
  }
}
