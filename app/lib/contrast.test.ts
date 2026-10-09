import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("matches known values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#123456", "#123456")).toBeCloseTo(1, 5);
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 1); // the classic AA threshold gray
  });
  it("is symmetric and rejects bad input", () => {
    expect(contrastRatio("#222222", "#eeeeee")).toBeCloseTo(contrastRatio("#eeeeee", "#222222"), 10);
    expect(contrastRatio("nope", "#fff")).toBeNaN();
  });
});

/* Guards the real design tokens, so a later palette tweak cannot quietly break readability. */
const css = readFileSync(fileURLToPath(new URL("../globals.css", import.meta.url)), "utf8");
const token = (name: string): string => {
  const m = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
  if (!m) throw new Error(`token --${name} not found in globals.css`);
  return m[1];
};
const SURFACES = ["surface-0", "surface-1", "surface-2"];

describe("design tokens", () => {
  const text: Array<[string, string[]]> = [
    ["fg", SURFACES],
    ["fg-secondary", SURFACES],
    ["accent-text", [...SURFACES, "accent-subtle"]],
    ["danger-text", SURFACES],
  ];
  for (const [fg, backgrounds] of text) {
    for (const bg of backgrounds) {
      it(`${fg} on ${bg} is at least 4.5:1`, () => {
        expect(contrastRatio(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it("white text on the primary button fill is at least 4.5:1", () => {
    expect(contrastRatio("#ffffff", token("accent"))).toBeGreaterThanOrEqual(4.5);
  });

  it("the focus ring is at least 3:1 on every surface", () => {
    for (const bg of SURFACES) expect(contrastRatio(token("accent-text"), token(bg))).toBeGreaterThanOrEqual(3);
  });
});