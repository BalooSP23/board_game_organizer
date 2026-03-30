import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST: link an extension to this game (set parentGameId)
export async function POST(request: NextRequest, context: RouteContext) {
  const { id: gameId } = await context.params;

  try {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json({ error: "Jeu introuvable." }, { status: 404 });
    }

    const body = await request.json();
    const { extensionId } = body;

    if (!extensionId || typeof extensionId !== "string") {
      return NextResponse.json(
        { error: "L'identifiant de l'extension est requis." },
        { status: 400 }
      );
    }

    // Prevent self-linking
    if (extensionId === gameId) {
      return NextResponse.json(
        { error: "Un jeu ne peut pas être sa propre extension." },
        { status: 400 }
      );
    }

    const extension = await prisma.game.findUnique({
      where: { id: extensionId },
      include: { extensions: { select: { id: true }, take: 1 } },
    });

    if (!extension) {
      return NextResponse.json(
        { error: "Extension introuvable." },
        { status: 404 }
      );
    }

    // Prevent deep nesting: extension cannot already have extensions
    if (extension.extensions.length > 0) {
      return NextResponse.json(
        { error: "Ce jeu a déjà des extensions, il ne peut pas devenir une extension." },
        { status: 400 }
      );
    }

    // Prevent deep nesting: parent game cannot itself be an extension
    if (game.parentGameId) {
      return NextResponse.json(
        { error: "Une extension ne peut pas avoir d'extensions." },
        { status: 400 }
      );
    }

    const updated = await prisma.game.update({
      where: { id: extensionId },
      data: { parentGameId: gameId },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de l'extension." },
      { status: 500 }
    );
  }
}

// DELETE: unlink an extension
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id: gameId } = await context.params;

  try {
    const body = await request.json();
    const { extensionId } = body;

    if (!extensionId || typeof extensionId !== "string") {
      return NextResponse.json(
        { error: "L'identifiant de l'extension est requis." },
        { status: 400 }
      );
    }

    const extension = await prisma.game.findFirst({
      where: { id: extensionId, parentGameId: gameId },
    });

    if (!extension) {
      return NextResponse.json(
        { error: "Extension introuvable pour ce jeu." },
        { status: 404 }
      );
    }

    await prisma.game.update({
      where: { id: extensionId },
      data: { parentGameId: null, fitsInParentBox: false },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'extension." },
      { status: 500 }
    );
  }
}

// PATCH: toggle fitsInParentBox on an extension
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: gameId } = await context.params;

  try {
    const body = await request.json();
    const { extensionId, fitsInParentBox } = body;

    if (!extensionId || typeof extensionId !== "string") {
      return NextResponse.json(
        { error: "L'identifiant de l'extension est requis." },
        { status: 400 }
      );
    }

    if (typeof fitsInParentBox !== "boolean") {
      return NextResponse.json(
        { error: "Le champ fitsInParentBox est requis." },
        { status: 400 }
      );
    }

    const extension = await prisma.game.findFirst({
      where: { id: extensionId, parentGameId: gameId },
    });

    if (!extension) {
      return NextResponse.json(
        { error: "Extension introuvable pour ce jeu." },
        { status: 404 }
      );
    }

    const updated = await prisma.game.update({
      where: { id: extensionId },
      data: { fitsInParentBox },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'extension." },
      { status: 500 }
    );
  }
}
