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
    const { isWishlisted, wishlistShopUrl } = body;

    const data: Record<string, unknown> = {};

    if (typeof isWishlisted === "boolean") {
      data.isWishlisted = isWishlisted;
    } else {
      // Toggle current value
      data.isWishlisted = !game.isWishlisted;
    }

    if (wishlistShopUrl !== undefined) {
      data.wishlistShopUrl = wishlistShopUrl ?? null;
    }

    const updated = await prisma.game.update({
      where: { id: gameId },
      data,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la wishlist." },
      { status: 500 }
    );
  }
}
