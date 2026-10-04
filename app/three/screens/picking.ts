export const CLICK_SLOP = 4;           // px: a press that moves further is a drag (orbit), not a click
export const OCCLUSION_EPSILON = 0.02; // m: screens mounted on a wall sit a few mm off it

type Point = { x: number; y: number };

export function isClick(down: Point, up: Point): boolean {
  return Math.hypot(up.x - down.x, up.y - down.y) <= CLICK_SLOP;
}

export type ScreenHit = { id: string; distance: number; locked: boolean };
export type PickResult = { kind: "select"; id: string } | { kind: "blocked" } | { kind: "none" };

/**
 * Decides what a click means. `screenHit` is the nearest screen under the pointer, and
 * `modelDistance` the distance to the model along the same ray (null when it isn't known or
 * nothing was hit). A wall in front of a screen makes it an empty click.
 */
export function resolvePick(screenHit: ScreenHit | null, modelDistance: number | null): PickResult {
  if (!screenHit) return { kind: "none" };
  if (modelDistance !== null && modelDistance < screenHit.distance - OCCLUSION_EPSILON) return { kind: "none" };
  if (screenHit.locked) return { kind: "blocked" };
  return { kind: "select", id: screenHit.id };
}