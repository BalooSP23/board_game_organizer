import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id: gameId } = await context.params;

  try {
    const images = await prisma.image.findMany({
      where: { gameId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(images);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des images." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: gameId } = await context.params;

  try {
    const body = await request.json();
    const { url, cloudinaryPublicId, caption } = body;

    if (!url) {
      return NextResponse.json(
        { error: "L'URL de l'image est requise." },
        { status: 400 }
      );
    }

    // Verify game exists
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json(
        { error: "Jeu introuvable." },
        { status: 404 }
      );
    }

    // Get next sort order
    const lastImage = await prisma.image.findFirst({
      where: { gameId },
      orderBy: { sortOrder: "desc" },
    });
    const sortOrder = (lastImage?.sortOrder ?? -1) + 1;

    const image = await prisma.image.create({
      data: {
        gameId,
        url,
        cloudinaryPublicId: cloudinaryPublicId ?? null,
        caption: caption ?? null,
        sortOrder,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de l'image." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id: gameId } = await context.params;

  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { error: "L'identifiant de l'image est requis." },
        { status: 400 }
      );
    }

    const image = await prisma.image.findFirst({
      where: { id: imageId, gameId },
    });

    if (!image) {
      return NextResponse.json(
        { error: "Image introuvable." },
        { status: 404 }
      );
    }

    // Destroy from Cloudinary if public ID exists
    if (image.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(image.cloudinaryPublicId);
      } catch {
        console.error(
          `Échec de la suppression Cloudinary pour ${image.cloudinaryPublicId}`
        );
      }
    }

    await prisma.image.delete({ where: { id: imageId } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'image." },
      { status: 500 }
    );
  }
}
