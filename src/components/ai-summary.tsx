"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface AiSummaryProps {
  gameId: string;
  initialSummary: string | null;
  initialGeneratedAt: string | null;
}

export function AiSummary({
  gameId,
  initialSummary,
  initialGeneratedAt,
}: AiSummaryProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [generatedAt, setGeneratedAt] = useState(initialGeneratedAt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/games/${gameId}/summary`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error ?? "Une erreur est survenue lors de la génération."
        );
      }
      const data = await res.json();
      setSummary(data.aiSummary);
      setGeneratedAt(data.aiSummaryGeneratedAt);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la génération."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Résumé IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="space-y-3">
            <div className="whitespace-pre-line leading-relaxed text-sm">
              {summary}
            </div>
            {generatedAt && (
              <p className="text-xs text-muted-foreground">
                Généré le{" "}
                {new Date(generatedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={loading}
              className="border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Régénérer
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {loading
                ? "Génération en cours…"
                : "Générer le résumé IA"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
