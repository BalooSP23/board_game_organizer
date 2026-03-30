import { Card, CardContent } from "@/components/ui/card";

interface CollectionValueProps {
  totalValue: number;
  gameCount: number;
  gamesWithPrice: number;
}

export function CollectionValue({ totalValue, gameCount, gamesWithPrice }: CollectionValueProps) {
  if (gamesWithPrice === 0) return null;

  const formattedValue = totalValue.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Card className="border-teal-500/30 bg-teal-50 dark:bg-teal-950/20 mb-6">
      <CardContent className="flex items-center justify-between py-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Valeur de la collection
          </p>
          <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">
            {formattedValue} €
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>{gameCount} jeu{gameCount > 1 ? "x" : ""}</p>
          {gamesWithPrice < gameCount && (
            <p>{gamesWithPrice} avec prix renseigné</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
