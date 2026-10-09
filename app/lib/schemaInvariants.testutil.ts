import {
  MAX_NAME_LENGTH,
  POSITION_RANGE,
  RESOLUTION_RANGE,
  SCREEN_SIZE_RANGE,
  type Screen,
} from "./schema";

const fin = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const within = (n: unknown, lo: number, hi: number) => fin(n) && n >= lo && n <= hi;

/** Everything the app relies on for a stored screen. Empty array means valid. */
export function screenProblems(s: Screen): string[] {
  const p: string[] = [];
  if (typeof s.id !== "string" || s.id.length === 0) p.push("id");
  if (typeof s.name !== "string" || !s.name.trim() || s.name.length > MAX_NAME_LENGTH) p.push("name");
  if (!within(s.width, SCREEN_SIZE_RANGE.min, SCREEN_SIZE_RANGE.max)) p.push("width");
  if (!within(s.height, SCREEN_SIZE_RANGE.min, SCREEN_SIZE_RANGE.max)) p.push("height");
  if (!Array.isArray(s.position) || s.position.length !== 3 || !s.position.every((n) => within(n, POSITION_RANGE.min, POSITION_RANGE.max))) p.push("position");
  if (!Array.isArray(s.rotation) || s.rotation.length !== 3 || !s.rotation.every(fin)) p.push("rotation");
  if (
    !Array.isArray(s.resolution) ||
    s.resolution.length !== 2 ||
    !s.resolution.every((n) => within(n, RESOLUTION_RANGE.min, RESOLUTION_RANGE.max) && Number.isInteger(n))
  ) p.push("resolution");
  if (!["none", "video", "web"].includes(s.content?.type)) p.push("content.type");
  if (!["contain", "cover"].includes(s.content?.fit)) p.push("content.fit");
  if (s.content?.src !== undefined && typeof s.content.src !== "string") p.push("content.src");
  if (typeof s.visible !== "boolean") p.push("visible");
  if (typeof s.locked !== "boolean") p.push("locked");
  return p;
}

/** Small deterministic PRNG, so a failing fuzz run can be repeated. */
export function seededRandom(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const KEYS = ["id", "name", "position", "rotation", "width", "height", "resolution", "content", "visible", "locked", "type", "src", "fit", "version", "screens", "model", "unit"];
const ATOMS: unknown[] = [NaN, Infinity, -Infinity, 1e308, -1e308, 0, -0, -5, 1.5, 3, "", " ", "x", "video:abc", "http://a.example/x.mp4", "contain", "cover", "video", "none", "web", true, false, null, undefined];

/** Random JSON-ish junk, to feed validators. */
export function junk(rand: () => number, depth = 0): unknown {
  const r = rand();
  if (depth >= 3 || r < 0.5) return ATOMS[Math.floor(rand() * ATOMS.length)];
  if (r < 0.75) return Array.from({ length: Math.floor(rand() * 4) }, () => junk(rand, depth + 1));
  const o: Record<string, unknown> = {};
  const n = Math.floor(rand() * 5);
  for (let i = 0; i < n; i++) o[KEYS[Math.floor(rand() * KEYS.length)]] = junk(rand, depth + 1);
  return o;
}