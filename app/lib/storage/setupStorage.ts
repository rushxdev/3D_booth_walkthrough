import { parseSetupText, setupToJson } from "../setupFile";
import type { SceneSetup } from "../schema";
import { classifyStorageError, STORAGE_MESSAGES, type StorageFailure } from "./storageErrors";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type IterableStorage = StorageLike & Pick<Storage, "key" | "length">;

export const SETUP_PREFIX = "booth:setup:";
export const LAST_SESSION_KEY = "booth:last-session";

export type LastSession = { modelKey: string; name: string; unit: string | null };

export type SaveResult = { ok: true } | { ok: false; reason: StorageFailure; message: string };
export type LoadResult =
  | { ok: true; setup: SceneSetup; skipped: number }
  | { ok: false; reason: "none" | "invalid" | "unavailable"; message: string };

const saveFailure = (error: unknown): SaveResult => {
  const reason = classifyStorageError(error);
  return { ok: false, reason, message: STORAGE_MESSAGES[reason] };
};

/** localStorage if it works at all, else null. A full disk still counts as working. */
export function getLocalStorage(): IterableStorage | null {
  try {
    if (typeof window === "undefined") return null;
    const storage = window.localStorage;
    try {
      storage.setItem("booth:probe", "1");
      storage.removeItem("booth:probe");
    } catch (error) {
      if (classifyStorageError(error) !== "quota") return null;
    }
    return storage;
  } catch {
    return null;
  }
}

/** Model keys that have a saved setup. */
export function listSetupKeys(storage: IterableStorage | null): string[] {
  if (!storage) return [];
  const out: string[] = [];
  try {
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k?.startsWith(SETUP_PREFIX)) out.push(k.slice(SETUP_PREFIX.length));
    }
  } catch {
    /* unreadable storage: report none */
  }
  return out;
}

export function saveSetup(storage: StorageLike | null, modelKey: string, setup: SceneSetup): SaveResult {
  if (!storage) return saveFailure({ name: "SecurityError" });
  try {
    storage.setItem(SETUP_PREFIX + modelKey, setupToJson(setup));
    return { ok: true };
  } catch (error) {
    return saveFailure(error);
  }
}

export function loadSetup(storage: StorageLike | null, modelKey: string): LoadResult {
  const unavailable: LoadResult = { ok: false, reason: "unavailable", message: STORAGE_MESSAGES.unavailable };
  if (!storage) return unavailable;

  let text: string | null;
  try {
    text = storage.getItem(SETUP_PREFIX + modelKey);
  } catch {
    return unavailable;
  }
  if (text === null) return { ok: false, reason: "none", message: "No saved setup for this model." };

  const parsed = parseSetupText(text);
  return parsed.ok
    ? { ok: true, setup: parsed.setup, skipped: parsed.skipped }
    : { ok: false, reason: "invalid", message: parsed.message };
}

export function removeSetup(storage: StorageLike | null, modelKey: string): void {
  try {
    storage?.removeItem(SETUP_PREFIX + modelKey);
  } catch {
    /* nothing to do */
  }
}

export function saveLastSession(storage: StorageLike | null, session: LastSession): SaveResult {
  if (!storage) return saveFailure({ name: "SecurityError" });
  try {
    storage.setItem(LAST_SESSION_KEY, JSON.stringify(session));
    return { ok: true };
  } catch (error) {
    return saveFailure(error);
  }
}

export function loadLastSession(storage: StorageLike | null): LastSession | null {
  try {
    const text = storage?.getItem(LAST_SESSION_KEY);
    if (!text) return null;
    const v = JSON.parse(text) as Partial<LastSession> | null;
    if (!v || typeof v.modelKey !== "string" || typeof v.name !== "string") return null;
    return { modelKey: v.modelKey, name: v.name, unit: typeof v.unit === "string" ? v.unit : null };
  } catch {
    return null;
  }
}

export function clearLastSession(storage: StorageLike | null): void {
  try {
    storage?.removeItem(LAST_SESSION_KEY);
  } catch {
    /* nothing to do */
  }
}