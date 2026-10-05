export const SCHEMA_VERSION = 1 as const;

export type Vec3 = [number, number, number];
export type ContentType = "none" | "video" | "web";
export type FitMode = "contain" | "cover";

export type ScreenContent = {
  type: ContentType;
  src?: string; // video: a reference to the stored file (Phase 9); web: a URL
  fit: FitMode;
};

export type Screen = {
  id: string;
  name: string;
  position: Vec3; // meters, world space (the center of the screen)
  rotation: Vec3; // radians, Euler order YXZ (yaw, pitch, roll); the UI shows degrees
  width: number;  // meters
  height: number; // meters
  resolution: [number, number]; // px, informational: never changes the geometry
  content: ScreenContent;
  visible: boolean;
  locked: boolean;
};

export type SceneSetup = {
  version: typeof SCHEMA_VERSION;
  model?: { name: string; unit: string };
  screens: Screen[];
};

export type ScreenPatch = Partial<Omit<Screen, "id">>;

export const SCREEN_SIZE_RANGE = { min: 0.1, max: 50 } as const; // meters
export const DEFAULT_SCREEN_SIZE = { width: 1.6, height: 0.9 } as const; // 16:9
export const MAX_NAME_LENGTH = 80;
const MAX_SRC_LENGTH = 2000;

export const POSITION_RANGE = { min: -1000, max: 1000 } as const; // meters
export const RESOLUTION_RANGE = { min: 16, max: 16384 } as const;  // px
export const DEFAULT_RESOLUTION: [number, number] = [1920, 1080];
const clampInt = (v: number) => Math.round(clamp(v, RESOLUTION_RANGE.min, RESOLUTION_RANGE.max));

const CONTENT_TYPES: readonly string[] = ["none", "video", "web"];
const FIT_MODES: readonly string[] = ["contain", "cover"];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const isFiniteNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isVec3 = (v: unknown): v is Vec3 => Array.isArray(v) && v.length === 3 && v.every(isFiniteNumber);

function sanitizeContent(raw: unknown): ScreenContent | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Partial<ScreenContent>;
  if (typeof c.type !== "string" || !CONTENT_TYPES.includes(c.type)) return null;
  const content: ScreenContent = {
    type: c.type as ContentType,
    fit: typeof c.fit === "string" && FIT_MODES.includes(c.fit) ? (c.fit as FitMode) : "contain",
  };
  if (typeof c.src === "string") content.src = c.src.slice(0, MAX_SRC_LENGTH);
  return content;
}

/**
 * Keeps only valid fields of a patch and normalizes them (trim, clamp, copy arrays). Anything
 * invalid is dropped, never thrown. Also the basis for validating imported files (9.4).
 */
export function sanitizeScreenPatch(patch: ScreenPatch): ScreenPatch {
  const out: ScreenPatch = {};

  if (typeof patch.name === "string") {
    const name = patch.name.trim().slice(0, MAX_NAME_LENGTH);
    if (name) out.name = name;
  }
  if (isVec3(patch.position)) {
    out.position = patch.position.map((n) => clamp(n, POSITION_RANGE.min, POSITION_RANGE.max)) as Vec3;
  }
  if (Array.isArray(patch.resolution) && patch.resolution.length === 2 && patch.resolution.every(isFiniteNumber)) {
    out.resolution = [clampInt(patch.resolution[0]), clampInt(patch.resolution[1])];
  }
  if (isVec3(patch.rotation)) out.rotation = [...patch.rotation];
  for (const key of ["width", "height"] as const) {
    const v = patch[key];
    if (isFiniteNumber(v)) out[key] = clamp(v, SCREEN_SIZE_RANGE.min, SCREEN_SIZE_RANGE.max);
  }
  if (patch.content !== undefined) {
    const content = sanitizeContent(patch.content);
    if (content) out.content = content;
  }
  if (typeof patch.visible === "boolean") out.visible = patch.visible;
  if (typeof patch.locked === "boolean") out.locked = patch.locked;
  return out;
}

/** A new 16:9 screen, 1.6 m wide, with overrides applied after validation. */
export function createScreen(id: string, name: string, overrides: ScreenPatch = {}): Screen {
  return {
    id,
    name,
    position: [0, 1.5, 0],
    rotation: [0, 0, 0],
    width: DEFAULT_SCREEN_SIZE.width,
    height: DEFAULT_SCREEN_SIZE.height,
    resolution: [...DEFAULT_RESOLUTION],
    content: { type: "none", fit: "contain" },
    visible: true,
    locked: false,
    ...sanitizeScreenPatch(overrides),
  };
}

/** "Screen N" with the next free number. Names the user changed don't count. */
export function nextScreenName(screens: ReadonlyArray<Pick<Screen, "name">>): string {
  let highest = 0;
  for (const s of screens) {
    const match = /^Screen (\d+)$/.exec(s.name);
    if (match) highest = Math.max(highest, Number(match[1]));
  }
  return `Screen ${highest + 1}`;
}