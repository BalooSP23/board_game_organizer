-- CreateTable
CREATE TABLE "GamePlacement" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "shelfId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "orientation" TEXT NOT NULL DEFAULT 'front',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GamePlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GamePlacement_gameId_key" ON "GamePlacement"("gameId");

-- CreateIndex
CREATE INDEX "GamePlacement_cellId_idx" ON "GamePlacement"("cellId");

-- CreateIndex
CREATE INDEX "GamePlacement_gameId_idx" ON "GamePlacement"("gameId");

-- AddForeignKey
ALTER TABLE "GamePlacement" ADD CONSTRAINT "GamePlacement_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlacement" ADD CONSTRAINT "GamePlacement_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "FurnitureCell"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlacement" ADD CONSTRAINT "GamePlacement_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "CellShelf"("id") ON DELETE SET NULL ON UPDATE CASCADE;
