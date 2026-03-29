import { NextRequest, NextResponse } from "next/server";
import { searchGames } from "@/lib/bgg";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length === 0) {
    return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
  }

  try {
    const results = await searchGames(q.trim());
    return NextResponse.json(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("queued") ? 202 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
