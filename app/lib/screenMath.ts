import { SCREEN_SIZE_RANGE } from "./schema";

export const INCH = 0.0254; // meters

export type Size = { width: number; height: number };

export const ASPECT_PRESETS = [
  { id: "16:9", label: "16:9 wide", ratio: 16 / 9 },
  { id: "21:9", label: "21:9 ultrawide", ratio: 21 / 9 },
  { id: "1:1", label: "1:1 square", ratio: 1 },
  { id: "9:16", label: "9:16 portrait", ratio: 9 / 16 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
] as const;
export type AspectPresetId = (typeof ASPECT_PRESETS)[number]["id"];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round4 = (v: number) => Math.round(v * 1e4) / 1e4; // 0.1 mm: removes float noise

export const diagonal = (width: number, height: number) => Math.hypot(width, height);
export const diagonalInches = (width: number, height: number) => diagonal(width, height) / INCH;

/** The preset a size matches (within 0.5%), or null for a custom shape. */
export function matchPreset(width: number, height: number, tolerance = 0.005): AspectPresetId | null {
  if (!(width > 0 && height > 0)) return null;
  const ratio = width / height;
  const found = ASPECT_PRESETS.find((p) => Math.abs(ratio - p.ratio) / p.ratio <= tolerance);
  return found ? found.id : null;
}

/** Scales a size into the allowed range, keeping its shape where that is possible. */
export function fitToRange(size: Size): Size {
  const { min, max } = SCREEN_SIZE_RANGE;
  let { width, height } = size;

  const over = Math.max(width, height);
  if (over > max) {
    width *= max / over;
    height *= max / over;
  }
  const under = Math.min(width, height);
  if (under < min) {
    width *= min / under;
    height *= min / under;
  }
  // an extreme shape can't satisfy both limits: clamp each side on its own
  return { width: round4(clamp(width, min, max)), height: round4(clamp(height, min, max)) };
}

/** Changes a size to a new aspect ratio (width / height), keeping the diagonal or the height. */
export function resizeToAspect(size: Size, ratio: number, keep: "diagonal" | "height"): Size {
  if (keep === "height") return fitToRange({ width: size.height * ratio, height: size.height });
  const height = diagonal(size.width, size.height) / Math.sqrt(1 + ratio * ratio);
  return fitToRange({ width: height * ratio, height });
}

/** A typed width; with the aspect lock on, the height follows to keep the current shape. */
export function applyWidth(size: Size, width: number, lockAspect: boolean): Size {
  if (!lockAspect || !(size.width > 0) || !(size.height > 0)) return { width, height: size.height };
  return fitToRange({ width, height: width * (size.height / size.width) });
}

export function applyHeight(size: Size, height: number, lockAspect: boolean): Size {
  if (!lockAspect || !(size.width > 0) || !(size.height > 0)) return { width: size.width, height };
  return fitToRange({ width: height * (size.width / size.height), height });
}

/** Informational: pixels per meter across the screen, and the gap between pixel centers. */
export const pixelDensity = (resolutionPx: number, meters: number) => (meters > 0 ? resolutionPx / meters : 0);
export const pixelPitchMm = (resolutionPx: number, meters: number) => (resolutionPx > 0 ? (meters * 1000) / resolutionPx : 0);

export const degToRad = (d: number) => (d * Math.PI) / 180;
export const radToDeg = (r: number) => (r * 180) / Math.PI;

/** Wraps an angle into (-180, 180]. */
export function wrapDegrees(d: number): number {
  const m = ((d % 360) + 360) % 360;
  return m > 180 ? m - 360 : m;
}