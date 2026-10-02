export function clamp(n: number, min = -Infinity, max = Infinity): number {
  return Math.min(max, Math.max(min, n));
}

export function roundTo(n: number, precision: number): number {
  const f = 10 ** precision;
  return Math.round(n * f) / f;
}

/** Parses user text. Returns null for empty, non-numeric or non-finite input. */
export function parseNumber(raw: string): number | null {
  const s = raw.trim().replace(",", ".");
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** "1.500" -> "1.5", 2 -> "2". Returns "" for non-finite values instead of "NaN". */
export function formatNumber(v: number, precision: number): string {
  if (!Number.isFinite(v)) return "";
  return Number(v.toFixed(precision)).toString();
}