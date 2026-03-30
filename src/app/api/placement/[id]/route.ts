import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { cellId, shelfId, position, orientation } = body;

  const existing = await prisma.gamePlacement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Placement not found" }, { status: 404 });
  }

  const updated = await prisma.gamePlacement.update({
    where: { id },
    data: {
      ...(cellId !== undefined && { cellId }),
      ...(shelfId !== undefined && { shelfId: shelfId ?? null }),
      ...(position !== undefined && { position }),
      ...(orientation !== undefined && { orientation }),
    },
    include: { game: true, cell: true, shelf: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;

  const existing = await prisma.gamePlacement.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Placement not found" }, { status: 404 });
  }

  await prisma.gamePlacement.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
