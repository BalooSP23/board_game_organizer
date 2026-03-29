"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GameCardProps {
  id: string;
  name: string;
  yearPublished?: number | null;
  thumbnailUrl?: string | null;
  minPlayers?: number | null;
  maxPlayers?: number | null;
  playingTime?: number | null;
  rating?: number | null;
}

export function GameCard({
  id,
  name,
  yearPublished,
  thumbnailUrl,
  minPlayers,
  maxPlayers,
  playingTime,
  rating,
}: GameCardProps) {
  const playersLabel =
    minPlayers && maxPlayers
      ? minPlayers === maxPlayers
        ? `${minPlayers} joueur${minPlayers > 1 ? "s" : ""}`
        : `${minPlayers}-${maxPlayers} joueurs`
      : null;

  return (
    <Link href={`/games/${id}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg h-full">
        <div className="relative aspect-square bg-muted">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              🎲
            </div>
          )}
          {rating != null && rating > 0 && (
            <Badge className="absolute top-2 right-2 bg-amber-500 text-white hover:bg-amber-600">
              ★ {rating.toFixed(1)}
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {name}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
            {yearPublished && <span>{yearPublished}</span>}
            {playersLabel && (
              <span className="flex items-center gap-0.5">
                👥 {playersLabel}
              </span>
            )}
            {playingTime != null && playingTime > 0 && (
              <span className="flex items-center gap-0.5">
                ⏱ {playingTime} min
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
