import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const furniture = await prisma.furniture.findMany({
    include: { cells: { include: { shelves: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(furniture);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, rows, cols } = body;

  if (!name || typeof rows !== "number" || typeof cols !== "number") {
    return NextResponse.json({ error: "name, rows, cols required" }, { status: 400 });
  }
  if (rows < 1 || rows > 5 || cols < 1 || cols > 5) {
    return NextResponse.json({ error: "rows and cols must be 1-5" }, { status: 400 });
  }

  const cells: { row: number; col: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ row: r, col: c });
    }
  }

  const furniture = await prisma.furniture.create({
    data: {
      name,
      rows,
      cols,
      cells: { create: cells },
    },
    include: { cells: { include: { shelves: true } } },
  });

  return NextResponse.json(furniture, { status: 201 });
}
