/** The one source of truth for what counts as walkable ground. */
export const MAX_SLOPE_DEG = 50;
export const FLOOR_MIN_NY = Math.cos((MAX_SLOPE_DEG * Math.PI) / 180); // ~0.643
export const CEILING_MAX_NY = -0.5;