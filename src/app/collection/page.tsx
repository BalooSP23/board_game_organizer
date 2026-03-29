import { prisma } from "@/lib/prisma";
import { GameCard } from "@/components/game-card";
import { ImportDialog } from "@/components/import-dialog";
import { Button } from "@/components/ui/button";

export default async function CollectionPage() {
  const games = await prisma.game.findMany({
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
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ma Collection</h1>
        <ImportDialog>
          <Button>Importer un jeu</Button>
        </ImportDialog>
      </div>

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
