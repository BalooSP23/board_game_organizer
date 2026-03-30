"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WishlistToggleProps {
  gameId: string;
  initialWishlisted: boolean;
  initialShopUrl: string | null;
}

export function WishlistToggle({
  gameId,
  initialWishlisted,
  initialShopUrl,
}: WishlistToggleProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [shopUrl, setShopUrl] = useState(initialShopUrl ?? "");
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    try {
      const res = await fetch(`/api/games/${gameId}/wishlist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isWishlisted: !wishlisted }),
      });
      if (res.ok) {
        setWishlisted(!wishlisted);
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveShopUrl() {
    setSaving(true);
    try {
      await fetch(`/api/games/${gameId}/wishlist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishlistShopUrl: shopUrl || null }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        disabled={saving}
        className="gap-1.5"
      >
        <Heart
          className={`h-5 w-5 transition-colors ${wishlisted ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`}
        />
        <span className="text-sm">
          {wishlisted ? "Dans la wishlist" : "Ajouter à la wishlist"}
        </span>
      </Button>

      {wishlisted && (
        <div className="flex items-center gap-2">
          <label htmlFor="shop-url" className="text-sm whitespace-nowrap">
            Lien boutique
          </label>
          <Input
            id="shop-url"
            type="url"
            placeholder="https://..."
            value={shopUrl}
            onChange={(e) => setShopUrl(e.target.value)}
            onBlur={saveShopUrl}
            className="h-8 w-56 text-sm"
          />
        </div>
      )}
    </div>
  );
}
