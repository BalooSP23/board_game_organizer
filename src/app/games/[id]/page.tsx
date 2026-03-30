import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Clock, Brain, Star, Box } from "lucide-react";
import { AiSummary } from "@/components/ai-summary";
import { GameGallery } from "@/components/game-gallery";

export const dynamic = "force-dynamic";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await prisma.game.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!game) notFound();

  const categories = (game.categories as string[] | null) ?? [];
  const mechanics = (game.mechanics as string[] | null) ?? [];

  const playersLabel =
    game.minPlayers && game.maxPlayers
      ? game.minPlayers === game.maxPlayers
        ? `${game.minPlayers}`
        : `${game.minPlayers}–${game.maxPlayers}`
      : game.minPlayers
        ? `${game.minPlayers}+`
        : null;

  const hasDimensions = game.boxWidth || game.boxHeight || game.boxDepth;
  const dimensionsLabel = hasDimensions
    ? [game.boxWidth, game.boxHeight, game.boxDepth]
        .map((d) => (d != null ? `${d}` : "?"))
        .join(" × ") + " cm"
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back link */}
      <Link
        href="/collection"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la collection
      </Link>

      {/* Hero section */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Cover image */}
        <div className="shrink-0">
          {game.imageUrl ? (
            <div className="relative w-64 h-80 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={game.imageUrl}
                alt={game.name}
                fill
                className="object-cover"
                sizes="256px"
              />
            </div>
          ) : (
            <div className="w-64 h-80 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              Pas d&apos;image
            </div>
          )}
        </div>

        {/* Title + info grid */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-bold">{game.name}</h1>
            {game.yearPublished && (
              <p className="text-muted-foreground text-lg">
                {game.yearPublished}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {playersLabel && (
              <InfoTile
                icon={<Users className="h-5 w-5 text-teal-600" />}
                label="Joueurs"
                value={playersLabel}
              />
            )}
            {game.playingTime && (
              <InfoTile
                icon={<Clock className="h-5 w-5 text-teal-600" />}
                label="Temps de jeu"
                value={`${game.playingTime} min`}
              />
            )}
            {game.weight != null && (
              <InfoTile
                icon={<Brain className="h-5 w-5 text-amber-600" />}
                label="Complexité"
                value={`${game.weight.toFixed(1)}/5`}
              />
            )}
            {game.rating != null && (
              <InfoTile
                icon={<Star className="h-5 w-5 text-amber-500" />}
                label="Note BGG"
                value={`${game.rating.toFixed(1)}/10`}
              />
            )}
          </div>

          {/* Dimensions */}
          {dimensionsLabel && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Box className="h-4 w-4" />
              <span>Dimensions de la boîte : {dimensionsLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {game.description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line leading-relaxed text-sm">
              {game.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Catégories</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge
                key={c}
                variant="secondary"
                className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
              >
                {c}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Mechanics */}
      {mechanics.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Mécaniques</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {mechanics.map((m) => (
              <Badge
                key={m}
                variant="outline"
                className="border-amber-400 text-amber-700 dark:text-amber-300"
              >
                {m}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Summary */}
      <AiSummary
        gameId={game.id}
        initialSummary={game.aiSummary ?? null}
        initialGeneratedAt={game.aiSummaryGeneratedAt?.toISOString() ?? null}
      />

      {/* Photo gallery & placeholder sections */}
      <div className="grid md:grid-cols-2 gap-4">
        <GameGallery gameId={game.id} initialImages={game.images} />
        <PlaceholderCard title="Extensions" />
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border p-3 text-center">
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function PlaceholderCard({ title }: { title: string }) {
  return (
    <Card className="opacity-60">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground italic">
          Bientôt disponible
        </p>
      </CardContent>
    </Card>
  );
}
