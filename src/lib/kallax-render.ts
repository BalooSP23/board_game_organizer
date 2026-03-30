import { KALLAX_CELL } from "./kallax";

/** Pixel size for one cell at scale=1 */
export const CELL_PX = 80;
/** Depth in px for 2.5D effect */
export const DEPTH_PX = 24;
/** Frame/wall thickness in px */
export const WALL_PX = 4;

/** Color palette */
export const COLORS = {
  frameOuter: "#8B6914",     // dark wood
  frameInner: "#C4A35A",     // lighter wood
  cellBg: "#F5F0E1",         // creamy interior
  cellSide: "#D4C088",       // side face
  cellTop: "#E8DDB5",        // top face
  shelfColor: "#A0522D",     // sienna for Lax Rax shelf
  shelfSide: "#8B4513",      // darker shelf edge
  laxRaxBg: "#E0F2F1",       // teal tint for cells with Lax Rax
} as const;

/** Compute x/y pixel offset for a cell in the grid */
export function cellPosition(row: number, col: number) {
  return {
    x: WALL_PX + col * (CELL_PX + WALL_PX),
    y: WALL_PX + row * (CELL_PX + WALL_PX),
  };
}

/** Total furniture outer dimensions in px */
export function furnitureDimensions(rows: number, cols: number) {
  return {
    width: cols * (CELL_PX + WALL_PX) + WALL_PX,
    height: rows * (CELL_PX + WALL_PX) + WALL_PX,
  };
}

/**
 * Convert game box dimensions (cm) to proportional pixel sizes within a cell.
 * Uses KALLAX_CELL real dimensions as reference.
 */
export function gameBoxPx(widthCm: number, heightCm: number): { w: number; h: number } {
  const scale = CELL_PX / KALLAX_CELL.heightCm; // px per cm
  return {
    w: Math.round(widthCm * scale),
    h: Math.round(heightCm * scale),
  };
}

/** Y-offset of a shelf within its cell (0-based index), given N total shelves */
export function shelfYOffset(index: number, totalShelves: number): number {
  const gap = CELL_PX / (totalShelves + 1);
  return gap * (index + 1);
}
