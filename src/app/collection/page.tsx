import { prisma } from "@/lib/prisma";
import { GameCard } from "@/components/game-card";
import { ImportDialog } from "@/components/import-dialog";
import { CollectionValue } from "@/components/collection-value";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export default async function CollectionPage() {
  const [games, aggregate, gamesWithPrice] = await Promise.all([
    prisma.game.findMany({
      where: { isWishlisted: false },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        yearPublished: true,
        thumbnailUrl: true,
        minPlayers: true,
        maxPlayers: true,
        playingTime: true,
        rating: true,
      },
    }),
    prisma.game.aggregate({
      where: { isWishlisted: false },
      _sum: { purchasePrice: true },
      _count: true,
    }),
    prisma.game.count({
      where: { isWishlisted: false, purchasePrice: { not: null } },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-amber-900">Ma Collection</h1>
        <ImportDialog>
          <Button>Importer un jeu</Button>
        </ImportDialog>
      </div>

      <CollectionValue
        totalValue={aggregate._sum.purchasePrice ?? 0}
        gameCount={aggregate._count}
        gamesWithPrice={gamesWithPrice}
      />

      {games.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">
            Aucun jeu dans votre collection
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Utilisez le bouton &quot;Importer un jeu&quot; pour ajouter des jeux
            depuis BoardGameGeek.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      )}
    </div>
  );
}
