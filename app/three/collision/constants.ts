/** The one source of truth for what counts as walkable ground. */
export const MAX_SLOPE_DEG = 50;
export const FLOOR_MIN_NY = Math.cos((MAX_SLOPE_DEG * Math.PI) / 180); // ~0.643
export const CEILING_MAX_NY = -0.5;
export const PLAYER_RADIUS = 0.3; // meters
export const PLAYER_HEIGHT = 1.7;
export const EYE_HEIGHT = 1.6;
export const STEP_HEIGHT = 0.35;   // highest rise the player walks up without stopping
export const SNAP_DOWN = 0.35;     // how far to follow the ground down while walking (stairs, ramps)
export const GRAVITY = 9.81;       // m/s^2
export const TERMINAL_SPEED = 15;  // m/s, caps the fall speed
/** Height of a walkable ground plane under everything, or null to walk on the model only. */
export const GROUND_PLANE_Y: number | null = 0;