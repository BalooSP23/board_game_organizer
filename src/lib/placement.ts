/**
 * Auto-placement algorithm — stub for T01, real implementation in T02.
 * Returns an array of placement instructions for the given games into furniture cells.
 */
export interface PlacementResult {
  gameId: string;
  cellId: string;
  shelfId?: string;
  position: number;
  orientation: "front" | "side" | "stacked";
}

export interface AutoPlaceResult {
  placed: PlacementResult[];
  unplaceable: string[]; // gameIds that couldn't fit
}

export async function autoPlace(
  _gameIds: string[],
  _furnitureId: string
): Promise<AutoPlaceResult> {
  // Stub — T02 implements dimension-aware bin-packing
  return { placed: [], unplaceable: _gameIds };
}
