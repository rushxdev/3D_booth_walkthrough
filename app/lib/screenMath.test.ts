import { describe, expect, it } from "vitest";
import {
  applyHeight,
  applyWidth,
  degToRad,
  diagonalInches,
  fitToRange,
  matchPreset,
  pixelDensity,
  pixelPitchMm,
  radToDeg,
  resizeToAspect,
  wrapDegrees,
} from "./screenMath";

describe("diagonalInches", () => {
  it("matches known display sizes", () => {
    expect(diagonalInches(1.2175, 0.6849)).toBeCloseTo(55, 1); // a 55 inch 16:9 TV
    expect(diagonalInches(1.6, 0.9)).toBeCloseTo(72.27, 2);
  });
});

describe("matchPreset", () => {
  it("recognizes the presets, with a little rounding tolerance", () => {
    expect(matchPreset(1.6, 0.9)).toBe("16:9");
    expect(matchPreset(3.2, 1.8)).toBe("16:9");
    expect(matchPreset(2.1, 0.9)).toBe("21:9");
    expect(matchPreset(1, 1)).toBe("1:1");
    expect(matchPreset(0.9, 1.6)).toBe("9:16");
    expect(matchPreset(1.2, 0.9)).toBe("4:3");
  });
  it("returns null for custom shapes and bad sizes", () => {
    expect(matchPreset(2, 1)).toBeNull();
    expect(matchPreset(0, 1)).toBeNull();
  });
});

describe("resizeToAspect", () => {
  const base = { width: 1.6, height: 0.9 };

  it("keeping the diagonal, portrait is the same display turned", () => {
    const r = resizeToAspect(base, 9 / 16, "diagonal");
    expect(r.width).toBeCloseTo(0.9, 3);
    expect(r.height).toBeCloseTo(1.6, 3);
  });

  it("keeping the diagonal, the diagonal really is preserved", () => {
    for (const ratio of [21 / 9, 1, 4 / 3]) {
      const r = resizeToAspect(base, ratio, "diagonal");
      expect(Math.hypot(r.width, r.height)).toBeCloseTo(Math.hypot(1.6, 0.9), 3);
      expect(r.width / r.height).toBeCloseTo(ratio, 3);
    }
  });

  it("keeping the height, only the width changes", () => {
    const r = resizeToAspect(base, 4 / 3, "height");
    expect(r).toEqual({ width: 1.2, height: 0.9 });
  });
});

describe("fitToRange", () => {
  it("scales an oversized screen down, keeping its shape", () => {
    expect(fitToRange({ width: 100, height: 50 })).toEqual({ width: 50, height: 25 });
  });
  it("scales a tiny screen up, keeping its shape", () => {
    expect(fitToRange({ width: 0.05, height: 0.02 })).toEqual({ width: 0.25, height: 0.1 });
  });
  it("clamps each side when the shape can't fit the range", () => {
    expect(fitToRange({ width: 100, height: 0.1 })).toEqual({ width: 50, height: 0.1 });
  });
  it("leaves a valid size alone", () => {
    expect(fitToRange({ width: 3.2, height: 1.8 })).toEqual({ width: 3.2, height: 1.8 });
  });
});

describe("applyWidth / applyHeight", () => {
  const size = { width: 1.6, height: 0.9 };
  it("changes only the edited side when the lock is off, so typed values stay exact", () => {
    expect(applyWidth(size, 3.2, false)).toEqual({ width: 3.2, height: 0.9 });
    expect(applyHeight(size, 1.8, false)).toEqual({ width: 1.6, height: 1.8 });
  });
  it("keeps the shape when the lock is on", () => {
    const w = applyWidth(size, 3.2, true);
    expect(w.width).toBe(3.2);
    expect(w.height).toBeCloseTo(1.8, 4);
    const h = applyHeight(size, 1.8, true);
    expect(h.width).toBeCloseTo(3.2, 4);
  });
  it("stays within range when the lock scales it", () => {
    const r = applyWidth(size, 500, true);
    expect(r.width).toBeLessThanOrEqual(50);
    expect(r.height).toBeCloseTo(r.width * (0.9 / 1.6), 3);
  });
});

describe("pixel density", () => {
  it("is pixels per meter and millimeters per pixel", () => {
    expect(pixelDensity(1920, 1.6)).toBe(1200);
    expect(pixelPitchMm(1920, 1.6)).toBeCloseTo(0.8333, 4);
    expect(pixelDensity(1920, 0)).toBe(0);
    expect(pixelPitchMm(0, 1.6)).toBe(0);
  });
});

describe("degrees", () => {
  it("converts both ways", () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI, 12);
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90, 12);
  });
  it("wraps into (-180, 180]", () => {
    expect(wrapDegrees(190)).toBe(-170);
    expect(wrapDegrees(-190)).toBe(170);
    expect(wrapDegrees(360)).toBe(0);
    expect(wrapDegrees(180)).toBe(180);
    expect(wrapDegrees(-180)).toBe(180);
    expect(wrapDegrees(270)).toBe(-90);
  });
});