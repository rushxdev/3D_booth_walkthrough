const MAX_SIDE = 512;
const MIN_ASPECT = 1 / 8;
const MAX_ASPECT = 8;

const fmt = (n: number) => Number(n.toFixed(2)).toString();

/** Text shown on an empty screen. */
export function screenLabelLines(name: string, width: number, height: number) {
  return { title: name, subtitle: `${fmt(width)} × ${fmt(height)} m` };
}

/**
 * Canvas size that keeps the screen's aspect (so text is not stretched), with the longer
 * side at 512 px. Aspects beyond 8:1 are clamped, which distorts text slightly.
 */
export function labelCanvasSize(width: number, height: number): [number, number] {
  const raw = width / height;
  const a = Number.isFinite(raw) && raw > 0 ? Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, raw)) : 1;
  return a >= 1 ? [MAX_SIDE, Math.round(MAX_SIDE / a)] : [Math.round(MAX_SIDE * a), MAX_SIDE];
}