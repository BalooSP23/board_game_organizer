"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Camera, Trash2, Upload, Loader2 } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  cloudinaryPublicId: string | null;
  caption: string | null;
  sortOrder: number;
}

interface GameGalleryProps {
  gameId: string;
  initialImages: GalleryImage[];
}

export function GameGallery({ gameId, initialImages }: GameGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUploadSuccess = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (result: any) => {
      const info = result?.info;
      if (!info || typeof info === "string" || !info.secure_url) return;

      try {
        const res = await fetch(`/api/games/${gameId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: info.secure_url,
            cloudinaryPublicId: info.public_id ?? null,
          }),
        });

        if (res.ok) {
          const newImage: GalleryImage = await res.json();
          setImages((prev) => [...prev, newImage]);
        }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'image:", error);
      }
    },
    [gameId]
  );

  const handleDelete = useCallback(
    async (imageId: string) => {
      setDeletingId(imageId);
      try {
        const res = await fetch(
          `/api/games/${gameId}/images?imageId=${imageId}`,
          { method: "DELETE" }
        );

        if (res.ok) {
          setImages((prev) => prev.filter((img) => img.id !== imageId));
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de l'image:", error);
      } finally {
        setDeletingId(null);
      }
    },
    [gameId]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Photos
        </h3>
        <CldUploadWidget
          signatureEndpoint="/api/sign-cloudinary-params"
          uploadPreset={undefined}
          options={{
            folder: `board-games/${gameId}`,
            sources: ["local", "url", "camera"],
            multiple: true,
            maxFiles: 10,
          }}
          onSuccess={handleUploadSuccess}
        >
          {({ open }) => (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => open()}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Ajouter des photos
            </Button>
          )}
        </CldUploadWidget>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-200 bg-amber-50/50 py-12 text-center">
          <Camera className="h-10 w-10 text-amber-300 mb-3" />
          <p className="text-sm text-amber-600 font-medium">
            Aucune photo ajoutée
          </p>
          <p className="text-xs text-amber-500 mt-1">
            Cliquez sur &quot;Ajouter des photos&quot; pour commencer
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-amber-200 bg-amber-50"
            >
              <Image
                src={image.url}
                alt={image.caption ?? "Photo du jeu"}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button
                type="button"
                onClick={() => handleDelete(image.id)}
                disabled={deletingId === image.id}
                className="absolute top-2 right-2 rounded-full bg-red-500/80 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                title="Supprimer cette photo"
              >
                {deletingId === image.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
