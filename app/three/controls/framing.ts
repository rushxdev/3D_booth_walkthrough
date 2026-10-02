import type { Vec3 } from "../loaders/normalize";

export type Bounds = { min: Vec3; max: Vec3 };

/** Used when nothing is loaded: a 10 x 3 x 10 m reference volume. */
export const DEFAULT_BOUNDS: Bounds = { min: [-5, 0, -5], max: [5, 3, 5] };

const MARGIN = 1.15;
// View from above and diagonally, so two walls and the floor read at once.
const DIR_LEN = Math.hypot(1, 0.75, 1);
const VIEW_DIRECTION: Vec3 = [1 / DIR_LEN, 0.75 / DIR_LEN, 1 / DIR_LEN];

export type Framing = { target: Vec3; position: Vec3; radius: number; distance: number };

/** Camera position and orbit target that fit the bounds in view (bounding sphere + margin). */
export function computeFraming(min: Vec3, max: Vec3, fovDeg: number, aspect: number): Framing {
  const size: Vec3 = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const radius = Math.max(0.5, 0.5 * Math.hypot(...size));
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;

  const vFov = (fovDeg * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * safeAspect);
  const fit = Math.min(vFov, hFov); // the narrower axis decides
  const distance = (radius / Math.sin(fit / 2)) * MARGIN;

  const target: Vec3 = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  const position: Vec3 = [
    target[0] + VIEW_DIRECTION[0] * distance,
    target[1] + VIEW_DIRECTION[1] * distance,
    target[2] + VIEW_DIRECTION[2] * distance,
  ];
  return { target, position, radius, distance };
}

export type ViewLimits = { near: number; far: number; minDistance: number; maxDistance: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Clip planes and zoom limits scaled to the model, to avoid z-fighting and clipping. */
export function viewLimits(radius: number): ViewLimits {
  return {
    near: clamp(radius / 400, 0.02, 2),
    far: Math.max(200, radius * 60),
    minDistance: Math.max(0.3, radius * 0.05),
    maxDistance: radius * 15,
  };
}