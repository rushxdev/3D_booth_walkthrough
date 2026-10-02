export const UNITS = ["mm", "cm", "m", "in", "ft"] as const;
export type Unit = (typeof UNITS)[number];

export const UNIT_TO_METERS: Record<Unit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  in: 0.0254,
  ft: 0.3048,
};

export const UNIT_LABELS: Record<Unit, string> = {
  mm: "Millimeters (mm)",
  cm: "Centimeters (cm)",
  m: "Meters (m)",
  in: "Inches (in)",
  ft: "Feet (ft)",
};

export const isUnit = (v: string): v is Unit => (UNITS as readonly string[]).includes(v);

// Largest dimension of a booth or stage, in meters.
const PLAUSIBLE_MIN_M = 1;
const PLAUSIBLE_MAX_M = 60;
const TYPICAL_M = 8;

/** Guesses the file's unit from its largest raw dimension. Never returns in/ft (ambiguous). */
export function guessUnit(largestDimension: number): Unit {
  if (!Number.isFinite(largestDimension) || largestDimension <= 0) return "m";
  if (largestDimension >= PLAUSIBLE_MIN_M && largestDimension <= PLAUSIBLE_MAX_M) return "m";

  let best: Unit = "m";
  let bestDistance = Infinity;
  for (const unit of ["m", "cm", "mm"] as const) {
    const meters = largestDimension * UNIT_TO_METERS[unit];
    const distance = Math.abs(Math.log10(meters / TYPICAL_M));
    if (distance < bestDistance) {
      best = unit; // strict < keeps "m" on ties
      bestDistance = distance;
    }
  }
  return best;
}