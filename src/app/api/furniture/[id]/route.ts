import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const furniture = await prisma.furniture.findUnique({
    where: { id },
    include: { cells: { include: { shelves: true }, orderBy: [{ row: "asc" }, { col: "asc" }] } },
  });
  if (!furniture) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(furniture);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const furniture = await prisma.furniture.update({ where: { id }, data: { name } });
  return NextResponse.json(furniture);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.furniture.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
