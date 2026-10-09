import { formatNumber } from "./number";

const UNIT_WORDS: Record<string, string> = {
  m: "meters",
  mm: "millimeters",
  cm: "centimeters",
  in: "inches",
  ft: "feet",
  "°": "degrees",
  px: "pixels",
};

export const unitWord = (unit?: string): string => (unit ? (UNIT_WORDS[unit] ?? unit) : "");

/** "1.6 meters" for screen readers. Undefined when the value is not a number. */
export function spokenValue(value: number, precision: number, unit?: string): string | undefined {
  if (!Number.isFinite(value)) return undefined;
  const n = formatNumber(value, precision);
  const word = unitWord(unit);
  return word ? `${n} ${word}` : n;
}