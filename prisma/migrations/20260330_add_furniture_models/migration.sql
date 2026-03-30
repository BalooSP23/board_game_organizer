-- CreateTable
CREATE TABLE "Furniture" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rows" INTEGER NOT NULL,
    "cols" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Furniture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FurnitureCell" (
    "id" TEXT NOT NULL,
    "furnitureId" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "col" INTEGER NOT NULL,
    "hasLaxRax" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "FurnitureCell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CellShelf" (
    "id" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "spacingMm" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CellShelf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FurnitureCell_furnitureId_idx" ON "FurnitureCell"("furnitureId");

-- CreateIndex
CREATE UNIQUE INDEX "FurnitureCell_furnitureId_row_col_key" ON "FurnitureCell"("furnitureId", "row", "col");

-- CreateIndex
CREATE INDEX "CellShelf_cellId_idx" ON "CellShelf"("cellId");

-- AddForeignKey
ALTER TABLE "FurnitureCell" ADD CONSTRAINT "FurnitureCell_furnitureId_fkey" FOREIGN KEY ("furnitureId") REFERENCES "Furniture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellShelf" ADD CONSTRAINT "CellShelf_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "FurnitureCell"("id") ON DELETE CASCADE ON UPDATE CASCADE;
