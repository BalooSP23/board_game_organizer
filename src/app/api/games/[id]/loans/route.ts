import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id: gameId } = await context.params;

  try {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json(
        { error: "Jeu introuvable." },
        { status: 404 }
      );
    }

    const loans = await prisma.loan.findMany({
      where: { gameId },
      orderBy: { loanDate: "desc" },
    });

    return NextResponse.json(loans);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des prêts." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
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
    const { borrowerName, loanDate, notes } = body;

    if (!borrowerName || typeof borrowerName !== "string" || !borrowerName.trim()) {
      return NextResponse.json(
        { error: "Le nom de l'emprunteur est requis." },
        { status: 400 }
      );
    }

    const loan = await prisma.loan.create({
      data: {
        gameId,
        borrowerName: borrowerName.trim(),
        loanDate: loanDate ? new Date(loanDate) : new Date(),
        notes: notes ?? null,
      },
    });

    return NextResponse.json(loan, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création du prêt." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id: gameId } = await context.params;

  try {
    const body = await request.json();
    const { loanId, returnDate } = body;

    if (!loanId) {
      return NextResponse.json(
        { error: "L'identifiant du prêt est requis." },
        { status: 400 }
      );
    }

    const loan = await prisma.loan.findFirst({
      where: { id: loanId, gameId },
    });

    if (!loan) {
      return NextResponse.json(
        { error: "Prêt introuvable." },
        { status: 404 }
      );
    }

    const updated = await prisma.loan.update({
      where: { id: loanId },
      data: {
        returnDate: returnDate ? new Date(returnDate) : new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du prêt." },
      { status: 500 }
    );
  }
}
