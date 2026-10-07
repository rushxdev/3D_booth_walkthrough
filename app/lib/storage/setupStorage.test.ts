import { describe, expect, it } from "vitest";
import { createScreen, SCHEMA_VERSION } from "../schema";
import { classifyStorageError } from "./storageErrors";
import {
  loadLastSession,
  loadSetup,
  removeSetup,
  saveLastSession,
  saveSetup,
  SETUP_PREFIX,
  type StorageLike,
} from "./setupStorage";

function memory(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const throwing = (name: string): StorageLike => {
  const boom = () => {
    throw new DOMException("x", name);
  };
  return { getItem: boom, setItem: boom, removeItem: boom };
};

const setup = { version: SCHEMA_VERSION, screens: [createScreen("a", "A", { width: 2 })] };

describe("classifyStorageError", () => {
  it("recognizes quota and unavailable errors", () => {
    expect(classifyStorageError(new DOMException("x", "QuotaExceededError"))).toBe("quota");
    expect(classifyStorageError({ name: "NS_ERROR_DOM_QUOTA_REACHED" })).toBe("quota");
    expect(classifyStorageError({ code: 22 })).toBe("quota");
    expect(classifyStorageError(new DOMException("x", "SecurityError"))).toBe("unavailable");
    expect(classifyStorageError(new Error("other"))).toBe("unknown");
    expect(classifyStorageError(null)).toBe("unknown");
  });
});

describe("setup storage", () => {
  it("saves and loads a setup", () => {
    const s = memory();
    expect(saveSetup(s, "k1", setup).ok).toBe(true);
    const r = loadSetup(s, "k1");
    expect(r.ok && r.setup).toEqual(setup);
  });

  it("keeps each model's setup separate", () => {
    const s = memory();
    saveSetup(s, "k1", setup);
    expect(loadSetup(s, "k2")).toMatchObject({ ok: false, reason: "none" });
    removeSetup(s, "k1");
    expect(loadSetup(s, "k1")).toMatchObject({ ok: false, reason: "none" });
  });

  it("reports quota errors without throwing", () => {
    const r = saveSetup(throwing("QuotaExceededError"), "k", setup);
    expect(r).toMatchObject({ ok: false, reason: "quota" });
    if (!r.ok) expect(r.message).toMatch(/full/);
  });

  it("reports missing storage as unavailable", () => {
    expect(saveSetup(null, "k", setup)).toMatchObject({ ok: false, reason: "unavailable" });
    expect(loadSetup(null, "k")).toMatchObject({ ok: false, reason: "unavailable" });
    expect(loadSetup(throwing("SecurityError"), "k")).toMatchObject({ ok: false, reason: "unavailable" });
  });

  it("treats corrupt stored data as invalid, not a crash", () => {
    const s = memory();
    s.data.set(SETUP_PREFIX + "k", "{broken");
    expect(loadSetup(s, "k")).toMatchObject({ ok: false, reason: "invalid" });
  });
});

describe("last session", () => {
  it("round trips and tolerates garbage", () => {
    const s = memory();
    saveLastSession(s, { modelKey: "k", name: "a.glb", unit: "cm" });
    expect(loadLastSession(s)).toEqual({ modelKey: "k", name: "a.glb", unit: "cm" });

    s.data.set("booth:last-session", JSON.stringify({ modelKey: 5 }));
    expect(loadLastSession(s)).toBeNull();
    s.data.set("booth:last-session", "nope");
    expect(loadLastSession(s)).toBeNull();
    expect(loadLastSession(null)).toBeNull();
  });

  it("normalizes a missing unit to null", () => {
    const s = memory();
    s.data.set("booth:last-session", JSON.stringify({ modelKey: "k", name: "n" }));
    expect(loadLastSession(s)?.unit).toBeNull();
  });
});