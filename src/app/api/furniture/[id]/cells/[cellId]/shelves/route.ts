import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VALID_SPACING_MM } from "@/lib/kallax";

type Params = { params: Promise<{ id: string; cellId: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id, cellId } = await params;

  // Verify cell belongs to furniture
  const cell = await prisma.furnitureCell.findFirst({
    where: { id: cellId, furnitureId: id },
  });
  if (!cell) return NextResponse.json({ error: "Cell not found" }, { status: 404 });

  const { hasLaxRax, shelves } = await request.json();

  // Update hasLaxRax flag
  await prisma.furnitureCell.update({
    where: { id: cellId },
    data: { hasLaxRax: !!hasLaxRax },
  });

  // Replace shelves: delete all, then create new ones
  await prisma.cellShelf.deleteMany({ where: { cellId } });

  if (hasLaxRax && Array.isArray(shelves)) {
    for (const s of shelves) {
      const spacingMm = VALID_SPACING_MM.includes(s.spacingMm) ? s.spacingMm : 0;
      await prisma.cellShelf.create({
        data: {
          cellId,
          position: s.position ?? 0,
          heightCm: s.heightCm ?? 0,
          spacingMm,
        },
      });
    }
  }

  const updated = await prisma.furnitureCell.findUnique({
    where: { id: cellId },
    include: { shelves: true },
  });

  return NextResponse.json(updated);
}
