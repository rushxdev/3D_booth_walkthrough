import { describe, expect, it } from "vitest";
import { MAX_NAME_LENGTH, SCREEN_SIZE_RANGE, createScreen, nextScreenName, sanitizeScreenPatch } from "./schema";
import type { ScreenPatch } from "./schema";

describe("sanitizeScreenPatch", () => {
  it("trims and caps names, and drops blank ones", () => {
    expect(sanitizeScreenPatch({ name: "  Main wall  " }).name).toBe("Main wall");
    expect(sanitizeScreenPatch({ name: "x".repeat(500) }).name).toHaveLength(MAX_NAME_LENGTH);
    expect(sanitizeScreenPatch({ name: "   " })).toEqual({});
  });

  it("clamps sizes and drops non-finite or non-numeric values", () => {
    expect(sanitizeScreenPatch({ width: 999, height: 0 })).toEqual({
      width: SCREEN_SIZE_RANGE.max,
      height: SCREEN_SIZE_RANGE.min,
    });
    for (const bad of [NaN, Infinity, "2" as unknown as number]) {
      expect(sanitizeScreenPatch({ width: bad })).toEqual({});
    }
  });

  it("accepts only three finite numbers for vectors, and copies them", () => {
    const position: [number, number, number] = [1, 2, 3];
    const out = sanitizeScreenPatch({ position });
    position[0] = 99;
    expect(out.position).toEqual([1, 2, 3]);
    expect(sanitizeScreenPatch({ position: [1, NaN, 3] })).toEqual({});
    expect(sanitizeScreenPatch({ rotation: [1, 2] as unknown as [number, number, number] })).toEqual({});
  });

  it("validates content", () => {
    expect(sanitizeScreenPatch({ content: { type: "video", src: "abc", fit: "cover" } }).content).toEqual({
      type: "video",
      src: "abc",
      fit: "cover",
    });
    expect(sanitizeScreenPatch({ content: { type: "flash" as never, fit: "cover" } })).toEqual({});
    expect(sanitizeScreenPatch({ content: { type: "web", fit: "stretch" as never } }).content?.fit).toBe("contain");
    expect(sanitizeScreenPatch({ content: { type: "web", src: 5 as never, fit: "contain" } }).content?.src).toBeUndefined();
  });

  it("ignores unknown fields such as an id", () => {
    expect(sanitizeScreenPatch({ id: "evil", width: 2 } as ScreenPatch)).toEqual({ width: 2 });
  });
});

describe("createScreen", () => {
  it("makes a 16:9 screen 1.6 m wide, visible and unlocked", () => {
    const s = createScreen("a", "Screen 1");
    expect([s.width, s.height]).toEqual([1.6, 0.9]);
    expect(s.visible).toBe(true);
    expect(s.locked).toBe(false);
    expect(s.content).toEqual({ type: "none", fit: "contain" });
  });

  it("applies valid overrides only and does not share arrays between screens", () => {
    const a = createScreen("a", "A", { width: 3.2, height: NaN });
    const b = createScreen("b", "B");
    expect([a.width, a.height]).toEqual([3.2, 0.9]);
    expect(a.position).not.toBe(b.position);
  });
});

describe("nextScreenName", () => {
  it("numbers from one", () => expect(nextScreenName([])).toBe("Screen 1"));
  it("continues after the highest number, ignoring renamed screens", () => {
    expect(nextScreenName([{ name: "Screen 1" }, { name: "Screen 3" }, { name: "Stage left" }, { name: "Screen 2 copy" }])).toBe("Screen 4");
  });
});