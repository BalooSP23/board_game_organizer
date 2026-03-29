import { XMLParser } from "fast-xml-parser";

const BGG_API = "https://boardgamegeek.com/xmlapi2";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => ["item", "link", "name", "version"].includes(name),
});

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#10;/g, "\n")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&#\d+;/g, (match) => {
      const code = parseInt(match.slice(2, -1), 10);
      return String.fromCharCode(code);
    });
}

export interface BggSearchResult {
  bggId: number;
  name: string;
  yearPublished: number | null;
}

export interface BggGameDetails {
  bggId: number;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  minPlayers: number | null;
  maxPlayers: number | null;
  playingTime: number | null;
  minPlayingTime: number | null;
  yearPublished: number | null;
  rating: number | null;
  weight: number | null;
  categories: string[];
  mechanics: string[];
  boxWidth: number | null;
  boxHeight: number | null;
  boxDepth: number | null;
}

export async function searchGames(query: string): Promise<BggSearchResult[]> {
  const url = `${BGG_API}/search?query=${encodeURIComponent(query)}&type=boardgame`;
  const res = await fetch(url);

  if (res.status === 202) {
    throw new Error("BGG request queued — please retry in a few seconds");
  }
  if (!res.ok) {
    throw new Error(`BGG search failed: ${res.status}`);
  }

  const xml = await res.text();
  const parsed = parser.parse(xml);
  const items = parsed?.items?.item;
  if (!items) return [];

  return items.map((item: Record<string, unknown>) => {
    const names = item.name as Record<string, unknown>[];
    const primaryName = names?.find((n) => n["@_type"] === "primary");
    return {
      bggId: Number(item["@_id"]),
      name: (primaryName?.["@_value"] as string) ?? "",
      yearPublished: item.yearpublished
        ? Number((item.yearpublished as Record<string, unknown>)["@_value"])
        : null,
    };
  });
}

export async function getGameDetails(bggId: number): Promise<BggGameDetails> {
  const url = `${BGG_API}/thing?id=${bggId}&stats=1&versions=1`;
  const res = await fetch(url);

  if (res.status === 202) {
    throw new Error("BGG request queued — please retry in a few seconds");
  }
  if (!res.ok) {
    throw new Error(`BGG details failed: ${res.status}`);
  }

  const xml = await res.text();
  const parsed = parser.parse(xml);
  const item = parsed?.items?.item?.[0];
  if (!item) throw new Error(`Game ${bggId} not found on BGG`);

  // Name
  const names = (item.name ?? []) as Record<string, unknown>[];
  const primaryName = names.find((n) => n["@_type"] === "primary");
  const name = (primaryName?.["@_value"] as string) ?? "";

  // Description
  const rawDesc = item.description as string | undefined;
  const description = rawDesc ? decodeHtmlEntities(rawDesc) : null;

  // Stats
  const stats = item.statistics?.ratings;
  const ratingVal = stats?.average?.["@_value"];
  const weightVal = stats?.averageweight?.["@_value"];

  // Links (categories & mechanics)
  const links = (item.link ?? []) as Record<string, unknown>[];
  const categories = links
    .filter((l) => l["@_type"] === "boardgamecategory")
    .map((l) => l["@_value"] as string);
  const mechanics = links
    .filter((l) => l["@_type"] === "boardgamemechanic")
    .map((l) => l["@_value"] as string);

  // Box dimensions from versions
  let boxWidth: number | null = null;
  let boxHeight: number | null = null;
  let boxDepth: number | null = null;

  const versions = item.versions?.item;
  if (Array.isArray(versions)) {
    for (const v of versions) {
      const w = Number(v.width?.["@_value"]);
      const l = Number(v.length?.["@_value"]);
      const d = Number(v.depth?.["@_value"]);
      if (w > 0 && l > 0 && d > 0) {
        boxWidth = w;
        boxHeight = l;
        boxDepth = d;
        break;
      }
    }
  }

  return {
    bggId,
    name,
    description,
    thumbnailUrl: (item.thumbnail as string) ?? null,
    imageUrl: (item.image as string) ?? null,
    minPlayers: item.minplayers ? Number(item.minplayers["@_value"]) : null,
    maxPlayers: item.maxplayers ? Number(item.maxplayers["@_value"]) : null,
    playingTime: item.playingtime ? Number(item.playingtime["@_value"]) : null,
    minPlayingTime: item.minplaytime
      ? Number(item.minplaytime["@_value"])
      : null,
    yearPublished: item.yearpublished
      ? Number(item.yearpublished["@_value"])
      : null,
    rating: ratingVal ? parseFloat(ratingVal) : null,
    weight: weightVal ? parseFloat(weightVal) : null,
    categories,
    mechanics,
    boxWidth,
    boxHeight,
    boxDepth,
  };
}
