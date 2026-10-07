import { describe, expect, it } from "vitest";
import { createScreen, SCHEMA_VERSION } from "./schema";
import {
  exportFileName,
  MAX_SCREENS,
  MAX_SETUP_CHARS,
  migrateTo,
  parseSetup,
  parseSetupText,
  serializeSetup,
  setupToJson,
  summarizeSetup,
} from "./setupFile";

const ok = (text: string) => {
  const r = parseSetupText(text);
  if (!r.ok) throw new Error(r.message);
  return r;
};
const wrap = (screens: unknown[], extra: object = {}) =>
  JSON.stringify({ version: 1, screens, ...extra });

describe("round trip", () => {
  it("export then import gives back the same screens and model", () => {
    const a = createScreen("a", "Stage left", {
      position: [1, 2, 3],
      rotation: [0.5, -1, 0],
      width: 3.2,
      height: 1.8,
      resolution: [3840, 2160],
      locked: true,
      content: { type: "video", src: "video:abc", fit: "cover" },
    });
    const b = createScreen("b", "Back wall", { visible: false });
    const setup = serializeSetup([a, b], { name: "booth.glb", unit: "cm" });
    const r = ok(setupToJson(setup));
    expect(r.setup).toEqual(setup);
    expect(r.skipped).toBe(0);
  });

  it("does not alias the live screens", () => {
    const a = createScreen("a", "A");
    const setup = serializeSetup([a]);
    setup.screens[0].position[0] = 99;
    expect(a.position[0]).toBe(0);
  });
});

describe("file-level problems", () => {
  it("rejects invalid JSON", () => {
    const r = parseSetupText("{nope");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/valid JSON/);
  });

  it("rejects values that are not objects", () => {
    for (const v of ["[]", "5", "null", '"x"']) expect(parseSetupText(v).ok).toBe(false);
  });

  it("rejects a missing or bad version", () => {
    for (const v of [undefined, 0, 1.5, "1", -2]) {
      expect(parseSetup({ version: v, screens: [] }).ok).toBe(false);
    }
  });

  it("rejects a newer version with a clear message", () => {
    const r = parseSetup({ version: SCHEMA_VERSION + 1, screens: [] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/newer version/);
  });

  it("rejects a setup without a screens array", () => {
    expect(parseSetup({ version: 1 }).ok).toBe(false);
    expect(parseSetup({ version: 1, screens: {} }).ok).toBe(false);
  });

  it("rejects oversized text without parsing it", () => {
    expect(parseSetupText("x".repeat(MAX_SETUP_CHARS + 1)).ok).toBe(false);
  });

  it("accepts an empty setup", () => {
    expect(ok(wrap([])).setup.screens).toEqual([]);
  });
});

describe("screen-level repair", () => {
  it("skips entries that are not objects and counts them", () => {
    const r = ok(wrap([1, null, "x", [], { id: "keep" }]));
    expect(r.setup.screens.map((s) => s.id)).toEqual(["keep"]);
    expect(r.skipped).toBe(4);
  });

  it("clamps sizes and drops invalid fields back to defaults", () => {
    const [s] = ok(wrap([{ id: "a", width: 999, height: "x", position: [NaN, 0, 0] }])).setup.screens;
    expect(s.width).toBe(50);
    expect(s.height).toBe(0.9);
    expect(s.position).toEqual([0, 1.5, 0]);
  });

  it("gives duplicate and missing ids fresh unique ids", () => {
    const ids = ok(wrap([{ id: "a" }, { id: "a" }, {}])).setup.screens.map((s) => s.id);
    expect(ids[0]).toBe("a");
    expect(new Set(ids).size).toBe(3);
  });

  it("names unnamed screens with the next free number", () => {
    const names = ok(wrap([{ name: "  " }, {}])).setup.screens.map((s) => s.name);
    expect(names).toEqual(["Screen 1", "Screen 2"]);
  });

  it("caps the number of screens", () => {
    const entries = Array.from({ length: MAX_SCREENS + 50 }, (_, i) => ({ id: `s${i}` }));
    const r = ok(wrap(entries));
    expect(r.setup.screens).toHaveLength(MAX_SCREENS);
    expect(r.skipped).toBe(50);
  });

  it("keeps stored video references and drops foreign ones", () => {
    const r = ok(
      wrap([
        { id: "a", content: { type: "video", src: "video:abc", fit: "cover" } },
        { id: "b", content: { type: "video", src: "http://evil.example/x.mp4", fit: "cover" } },
      ]),
    );
    expect(r.setup.screens[0].content.src).toBe("video:abc");
    expect(r.setup.screens[1].content.src).toBeUndefined();
    expect(r.setup.screens[1].content.type).toBe("video");
  });

  it("keeps a valid model and drops an invalid one", () => {
    expect(ok(wrap([], { model: { name: "a.glb", unit: "cm" } })).setup.model).toEqual({ name: "a.glb", unit: "cm" });
    expect(ok(wrap([], { model: { name: 5 } })).setup.model).toBeUndefined();
  });
});

describe("migrateTo", () => {
  it("runs each step in order and stamps the version", () => {
    const r = migrateTo({ version: 1, a: 1 }, 3, {
      1: (d) => ({ ...d, b: 2 }),
      2: (d) => ({ ...d, c: 3 }),
    });
    expect(r).toEqual({ ok: true, data: { version: 3, a: 1, b: 2, c: 3 } });
  });

  it("fails when a step is missing", () => {
    expect(migrateTo({ version: 1 }, 2, {}).ok).toBe(false);
  });

  it("does nothing at the target version", () => {
    const r = migrateTo({ version: 2, x: 1 }, 2, {});
    expect(r).toEqual({ ok: true, data: { version: 2, x: 1 } });
  });
});

describe("helpers", () => {
  it("summarizes counts and skipped entries", () => {
    const one = { version: 1 as const, screens: [createScreen("a", "A")] };
    expect(summarizeSetup(one, 0)).toBe("1 screen");
    expect(summarizeSetup({ ...one, screens: [] }, 2)).toBe("0 screens (2 entries skipped)");
  });

  it("builds a safe export file name", () => {
    const d = new Date("2026-10-07T12:00:00Z");
    expect(exportFileName("My Booth.glb", d)).toBe("booth-setup-my-booth-2026-10-07.json");
    expect(exportFileName("../../etc/passwd", d)).toBe("booth-setup-etc-passwd-2026-10-07.json");
    expect(exportFileName(undefined, d)).toBe("booth-setup-2026-10-07.json");
    expect(exportFileName("***", d)).toBe("booth-setup-2026-10-07.json");
  });
});