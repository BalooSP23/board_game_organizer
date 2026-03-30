export const KALLAX_SIZES = [
  { label: "1×1", rows: 1, cols: 1 },
  { label: "1×2", rows: 1, cols: 2 },
  { label: "1×4", rows: 1, cols: 4 },
  { label: "2×2", rows: 2, cols: 2 },
  { label: "2×4", rows: 2, cols: 4 },
  { label: "3×4", rows: 3, cols: 4 },
  { label: "4×4", rows: 4, cols: 4 },
  { label: "5×5", rows: 5, cols: 5 },
] as const;

/** Internal cell dimensions in cm */
export const KALLAX_CELL = {
  widthCm: 33,
  heightCm: 33,
  depthCm: 39,
} as const;

/** Valid shelf spacing values in mm */
export const VALID_SPACING_MM = [0, 1, 2] as const;
