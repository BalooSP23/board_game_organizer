import { KALLAX_CELL } from "./kallax";

// ─── Input types (pure, no DB dependency) ────────────────────────────

export interface GameForPlacement {
  id: string;
  name: string;
  boxWidth: number | null;
  boxHeight: number | null;
  boxDepth: number | null;
  category?: string | null;
}

export interface ShelfForPlacement {
  id: string;
  position: number;
  heightCm: number;
  spacingMm: number;
}

export interface CellForPlacement {
  id: string;
  row: number;
  col: number;
  hasLaxRax: boolean;
  shelves: ShelfForPlacement[];
}

export interface FurnitureForPlacement {
  id: string;
  name: string;
  rows: number;
  cols: number;
  cells: CellForPlacement[];
}

// ─── Output types ────────────────────────────────────────────────────

export type Orientation = "front" | "side";

export interface PlacementResult {
  gameId: string;
  cellId: string;
  shelfId?: string;
  position: number;
  orientation: Orientation;
}

export interface UnplacedGame {
  gameId: string;
  reason: string;
}

export interface AutoPlaceResult {
  placed: PlacementResult[];
  unplaceable: UnplacedGame[];
}

export interface ReorganizationResult {
  placements: PlacementResult[];
  unplaceable: UnplacedGame[];
  moves: { gameId: string; from: { cellId: string; shelfId?: string }; to: { cellId: string; shelfId?: string } }[];
  added: PlacementResult[];
}

// ─── Slot abstraction ────────────────────────────────────────────────

interface Slot {
  cellId: string;
  shelfId?: string;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  remainingHeightCm: number; // vertical stacking capacity left
}

// ─── Core helpers ────────────────────────────────────────────────────

/**
 * Check if a game fits in a slot in a given orientation.
 * Returns the orientation if it fits, null otherwise.
 *
 * "front" means the box face (width × height) faces you, depth goes into the shelf.
 * "side" means the box is rotated 90° so depth faces you, width goes into the shelf.
 */
export function gameFitsInSlot(
  game: { boxWidth: number; boxHeight: number; boxDepth: number },
  slot: { widthCm: number; heightCm: number; depthCm: number }
): Orientation | null {
  // Front orientation: game width ≤ slot width, game height ≤ slot height, game depth ≤ slot depth
  if (
    game.boxWidth <= slot.widthCm &&
    game.boxHeight <= slot.heightCm &&
    game.boxDepth <= slot.depthCm
  ) {
    return "front";
  }
  // Side orientation: rotate box so depth faces front
  // game depth ≤ slot width, game height ≤ slot height, game width ≤ slot depth
  if (
    game.boxDepth <= slot.widthCm &&
    game.boxHeight <= slot.heightCm &&
    game.boxWidth <= slot.depthCm
  ) {
    return "side";
  }
  return null;
}

/**
 * Compute available slots for a cell.
 * Plain cell → one full-height slot.
 * Lax Rax cell → one slot per section between shelves.
 */
export function computeAvailableSlots(cell: CellForPlacement): Slot[] {
  const w = KALLAX_CELL.widthCm;
  const d = KALLAX_CELL.depthCm;
  const totalH = KALLAX_CELL.heightCm;

  if (!cell.hasLaxRax || cell.shelves.length === 0) {
    return [
      {
        cellId: cell.id,
        widthCm: w,
        heightCm: totalH,
        depthCm: d,
        remainingHeightCm: totalH,
      },
    ];
  }

  // Sort shelves by position (bottom to top)
  const sorted = [...cell.shelves].sort((a, b) => a.position - b.position);

  const slots: Slot[] = [];
  let currentBottom = 0;

  for (const shelf of sorted) {
    const shelfThicknessCm = shelf.spacingMm / 10; // mm → cm
    const sectionHeight = shelf.heightCm; // height of the section below/at this shelf
    if (sectionHeight > 0) {
      slots.push({
        cellId: cell.id,
        shelfId: shelf.id,
        widthCm: w,
        heightCm: sectionHeight,
        depthCm: d,
        remainingHeightCm: sectionHeight,
      });
    }
    currentBottom += sectionHeight + shelfThicknessCm;
  }

  // Remaining space above last shelf
  const remaining = totalH - currentBottom;
  if (remaining > 0) {
    slots.push({
      cellId: cell.id,
      widthCm: w,
      heightCm: remaining,
      depthCm: d,
      remainingHeightCm: remaining,
    });
  }

  return slots;
}

// ─── Main algorithm ──────────────────────────────────────────────────

/**
 * Greedy bin-packing: sort games by height descending,
 * place each into the first slot that fits, tracking remaining capacity per slot.
 */
export function computePlacement(
  games: GameForPlacement[],
  furniture: FurnitureForPlacement
): AutoPlaceResult {
  if (games.length === 0) {
    return { placed: [], unplaceable: [] };
  }

  // Separate games with/without dimensions
  const withDims: (GameForPlacement & { boxWidth: number; boxHeight: number; boxDepth: number })[] = [];
  const unplaceable: UnplacedGame[] = [];

  for (const g of games) {
    if (g.boxWidth == null || g.boxHeight == null || g.boxDepth == null) {
      unplaceable.push({ gameId: g.id, reason: "Missing box dimensions" });
    } else {
      withDims.push(g as GameForPlacement & { boxWidth: number; boxHeight: number; boxDepth: number });
    }
  }

  // Sort by height descending (tallest first = better packing)
  withDims.sort((a, b) => b.boxHeight - a.boxHeight);

  // Build slot list from all cells
  const slots: Slot[] = [];
  for (const cell of furniture.cells) {
    slots.push(...computeAvailableSlots(cell));
  }

  const placed: PlacementResult[] = [];
  // Track how many games placed per slot for position numbering
  const slotPositionCount = new Map<string, number>();
  const slotKey = (s: Slot) => `${s.cellId}:${s.shelfId ?? ""}`;

  for (const game of withDims) {
    let fitted = false;

    for (const slot of slots) {
      const orientation = gameFitsInSlot(game, {
        widthCm: slot.widthCm,
        heightCm: slot.remainingHeightCm,
        depthCm: slot.depthCm,
      });

      if (orientation) {
        const key = slotKey(slot);
        const pos = slotPositionCount.get(key) ?? 0;

        placed.push({
          gameId: game.id,
          cellId: slot.cellId,
          shelfId: slot.shelfId,
          position: pos,
          orientation,
        });

        slotPositionCount.set(key, pos + 1);
        // Reduce remaining height by the game's box height (stacking)
        slot.remainingHeightCm -= game.boxHeight;
        fitted = true;
        break;
      }
    }

    if (!fitted) {
      unplaceable.push({ gameId: game.id, reason: "Too large for any available cell or slot" });
    }
  }

  return { placed, unplaceable };
}

// ─── Reorganization ──────────────────────────────────────────────────

/**
 * Compute minimal reorganization when adding a new game.
 * Strategy: compute fresh placement including the new game, then diff against current.
 */
export function computeReorganization(
  currentPlacements: PlacementResult[],
  allGames: GameForPlacement[],
  furniture: FurnitureForPlacement
): ReorganizationResult {
  const fresh = computePlacement(allGames, furniture);

  // Build lookup of current placements by gameId
  const currentMap = new Map<string, PlacementResult>();
  for (const p of currentPlacements) {
    currentMap.set(p.gameId, p);
  }

  const moves: ReorganizationResult["moves"] = [];
  const added: PlacementResult[] = [];

  for (const p of fresh.placed) {
    const cur = currentMap.get(p.gameId);
    if (!cur) {
      // New placement (the added game or previously unplaced)
      added.push(p);
    } else if (cur.cellId !== p.cellId || cur.shelfId !== p.shelfId) {
      moves.push({
        gameId: p.gameId,
        from: { cellId: cur.cellId, shelfId: cur.shelfId },
        to: { cellId: p.cellId, shelfId: p.shelfId },
      });
    }
  }

  return {
    placements: fresh.placed,
    unplaceable: fresh.unplaceable,
    moves,
    added,
  };
}

// ─── Legacy wrapper (used by POST /api/placement) ────────────────────

export async function autoPlace(
  gameIds: string[],
  _furnitureId: string
): Promise<{ placed: PlacementResult[]; unplaceable: string[] }> {
  // This is now a thin DB-aware wrapper. The real logic is in computePlacement.
  // The API route should fetch games + furniture from DB and call computePlacement directly.
  // Kept for backward compatibility during migration.
  return { placed: [], unplaceable: gameIds };
}
