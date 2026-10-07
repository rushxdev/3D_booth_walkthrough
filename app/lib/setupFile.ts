import { newId } from "./id";
import {
  createScreen,
  nextScreenName,
  sanitizeScreenPatch,
  SCHEMA_VERSION,
  VIDEO_SRC_PREFIX,
  type SceneSetup,
  type Screen,
  type ScreenPatch,
} from "./schema";
// Same constant the video registry uses; a stored video src always starts with it.

export const MAX_SETUP_CHARS = 5_000_000;
export const MAX_SCREENS = 200;
const MAX_ID_LENGTH = 100;

export type Migration = (data: Record<string, unknown>) => Record<string, unknown>;
type Fail = { ok: false; message: string };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const fail = (message: string): Fail => ({ ok: false, message });

/** Migrations from version N to N + 1. Empty while the schema is still version 1. */
const MIGRATIONS: Record<number, Migration> = {};

export function migrateTo(
  input: Record<string, unknown>,
  target: number,
  migrations: Record<number, Migration>,
): { ok: true; data: Record<string, unknown> } | Fail {
  let data = input;
  let version = data.version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    return fail("This file has no valid version number, so it doesn't look like a setup exported from this tool.");
  }
  if (version > target) {
    return fail(`This setup was made by a newer version of the tool (version ${version}). Update the tool to open it.`);
  }
  while (version < target) {
    const step = migrations[version];
    if (!step) return fail(`This setup is version ${version} and can't be upgraded.`);
    data = { ...step(data), version: version + 1 };
    version += 1;
  }
  return { ok: true, data };
}

function parseScreen(raw: unknown, usedIds: Set<string>, accepted: Screen[]): Screen | null {
  if (!isRecord(raw)) return null;

  const rawId = typeof raw.id === "string" ? raw.id.trim() : "";
  const id = rawId && rawId.length <= MAX_ID_LENGTH && !usedIds.has(rawId) ? rawId : newId();
  usedIds.add(id);

  const patch: ScreenPatch = sanitizeScreenPatch(raw as ScreenPatch);

  // A video reference we can't have created is dropped: the screen shows "content missing".
  const c = patch.content;
  if (c?.type === "video" && c.src !== undefined && !c.src.startsWith(VIDEO_SRC_PREFIX)) {
    patch.content = { type: c.type, fit: c.fit };
  }

  return createScreen(id, nextScreenName(accepted), patch);
}

function parseModel(raw: unknown): SceneSetup["model"] {
  if (!isRecord(raw) || typeof raw.name !== "string" || typeof raw.unit !== "string") return undefined;
  const name = raw.name.trim().slice(0, 200);
  const unit = raw.unit.trim().slice(0, 10);
  return name && unit ? { name, unit } : undefined;
}

export type SetupParseResult = { ok: true; setup: SceneSetup; skipped: number } | Fail;

/** Validates an already-parsed JSON value. Never throws. */
export function parseSetup(raw: unknown): SetupParseResult {
  if (!isRecord(raw)) return fail("This file isn't a screen setup.");

  const migrated = migrateTo(raw, SCHEMA_VERSION, MIGRATIONS);
  if (!migrated.ok) return migrated;
  const data = migrated.data;

  if (!Array.isArray(data.screens)) return fail("This setup has no list of screens.");

  const screens: Screen[] = [];
  const usedIds = new Set<string>();
  let skipped = 0;
  for (const entry of data.screens) {
    if (screens.length >= MAX_SCREENS) {
      skipped++;
      continue;
    }
    const screen = parseScreen(entry, usedIds, screens);
    if (screen) screens.push(screen);
    else skipped++;
  }

  const setup: SceneSetup = { version: SCHEMA_VERSION, screens };
  const model = parseModel(data.model);
  if (model) setup.model = model;
  return { ok: true, setup, skipped };
}

/** Parses the text of a setup file or a stored value. Never throws. */
export function parseSetupText(text: string): SetupParseResult {
  if (text.length > MAX_SETUP_CHARS) return fail("This file is too large to be a screen setup.");
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return fail("This file isn't valid JSON.");
  }
  return parseSetup(raw);
}

export function serializeSetup(screens: readonly Screen[], model?: SceneSetup["model"]): SceneSetup {
  const setup: SceneSetup = { version: SCHEMA_VERSION, screens: structuredClone([...screens]) };
  if (model) setup.model = { ...model };
  return setup;
}

export const setupToJson = (setup: SceneSetup) => JSON.stringify(setup, null, 2);

/** One line for the import confirmation, e.g. "12 screens (2 entries skipped)". */
export function summarizeSetup(setup: SceneSetup, skipped: number): string {
  const n = setup.screens.length;
  const base = `${n} ${n === 1 ? "screen" : "screens"}`;
  return skipped > 0 ? `${base} (${skipped} ${skipped === 1 ? "entry" : "entries"} skipped)` : base;
}

/** booth-setup-<model>-YYYY-MM-DD.json */
export function exportFileName(modelName: string | undefined, date: Date): string {
  const slug = (modelName ?? "")
    .replace(/\.[a-z0-9]{1,5}$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  const day = date.toISOString().slice(0, 10);
  return slug ? `booth-setup-${slug}-${day}.json` : `booth-setup-${day}.json`;
}