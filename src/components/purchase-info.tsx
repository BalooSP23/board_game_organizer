"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PurchaseInfoProps {
  gameId: string;
  initialPrice: number | null;
  initialDate: string | null;
}

export function PurchaseInfo({
  gameId,
  initialPrice,
  initialDate,
}: PurchaseInfoProps) {
  const [price, setPrice] = useState(initialPrice?.toString() ?? "");
  const [date, setDate] = useState(initialDate ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/games/${gameId}/purchase`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchasePrice: price ? Number(price) : null,
          purchaseDate: date || null,
        }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Prix d&apos;achat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="purchase-price" className="text-sm">
            Prix d&apos;achat
          </label>
          <div className="flex items-center gap-1">
            <Input
              id="purchase-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-8 text-sm w-32"
            />
            <span className="text-sm text-muted-foreground">€</span>
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="purchase-date" className="text-sm">
            Date d&apos;achat
          </label>
          <Input
            id="purchase-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-8 text-sm w-44"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={save} disabled={saving}>
            Enregistrer
          </Button>
          {saved && (
            <span className="text-xs text-green-600">✓ Enregistré</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
