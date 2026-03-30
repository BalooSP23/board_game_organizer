import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

export const maxDuration = 60;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const game = await prisma.game.findUnique({ where: { id } });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const prompt = `Tu es un expert en jeux de société. Recherche sur le web des critiques et avis pour le jeu "${game.name}" sur les sites suivants : Philibert, Tric Trac, Gus&Co, Ludum, et BoardGameGeek (BGG).

Rédige une synthèse complète EN FRANÇAIS qui inclut :
- Un résumé du concept et des mécaniques du jeu
- Les points forts relevés par les critiques
- Les points faibles ou critiques négatives
- Le public cible et les conditions idéales de jeu
- Une note de consensus si disponible

La synthèse doit faire entre 200 et 400 mots, être bien structurée et rédigée dans un français soigné.`;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      tools: [{ type: "web_search_preview" }],
      input: prompt,
    });

    const summary = response.output_text;
    const generatedAt = new Date();

    await prisma.game.update({
      where: { id },
      data: {
        aiSummary: summary,
        aiSummaryGeneratedAt: generatedAt,
      },
    });

    return NextResponse.json({ summary, generatedAt });
  } catch (error) {
    console.error("[AI Summary] Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate AI summary" },
      { status: 500 }
    );
  }
}
