import { describe, expect, it } from "vitest";
import { computeFit } from "./videoFit";

const W169 = 16 / 9;
const P916 = 9 / 16;

describe("computeFit", () => {
  it("is a full stretch when aspects match", () => {
    for (const fit of ["contain", "cover"] as const) {
      const f = computeFit(W169, W169, fit);
      expect(f.quad).toEqual([1, 1]);
      expect(f.repeat).toEqual([1, 1]);
      expect(f.offset).toEqual([0, 0]);
    }
  });

  it("contain: 16:9 video on a portrait screen letterboxes top and bottom", () => {
    const f = computeFit(W169, P916, "contain");
    expect(f.quad[0]).toBe(1);
    expect(f.quad[1]).toBeCloseTo(P916 / W169, 6); // about 0.316
    expect(f.repeat).toEqual([1, 1]);
  });

  it("contain: portrait video on a wide screen pillarboxes left and right", () => {
    const f = computeFit(P916, W169, "contain");
    expect(f.quad[1]).toBe(1);
    expect(f.quad[0]).toBeCloseTo(P916 / W169, 6);
  });

  it("cover: 16:9 video on a portrait screen crops the sides, centered", () => {
    const f = computeFit(W169, P916, "cover");
    expect(f.repeat[1]).toBe(1);
    expect(f.repeat[0]).toBeCloseTo(P916 / W169, 6);
    expect(f.offset[0]).toBeCloseTo((1 - f.repeat[0]) / 2, 6);
    expect(f.offset[1]).toBe(0);
  });

  it("cover: portrait video on a wide screen crops top and bottom, centered", () => {
    const f = computeFit(P916, W169, "cover");
    expect(f.repeat[0]).toBe(1);
    expect(f.repeat[1]).toBeCloseTo(P916 / W169, 6);
    expect(f.offset[1]).toBeCloseTo((1 - f.repeat[1]) / 2, 6);
  });

  it("never stretches: picture aspect equals video aspect (contain), visible region equals screen aspect (cover)", () => {
    const aspects = [0.5, 9 / 16, 1, 4 / 3, 16 / 9, 21 / 9, 2.39, 3.6];
    for (const content of aspects) {
      for (const screen of aspects) {
        const c = computeFit(content, screen, "contain");
        expect((c.quad[0] / c.quad[1]) * screen).toBeCloseTo(content, 6);
        expect(Math.max(...c.quad)).toBeCloseTo(1, 6);

        const v = computeFit(content, screen, "cover");
        expect(((v.repeat[0] * content) / v.repeat[1])).toBeCloseTo(screen, 6);
        expect(v.offset[0] + v.repeat[0]).toBeLessThanOrEqual(1 + 1e-9);
        expect(v.offset[1] + v.repeat[1]).toBeLessThanOrEqual(1 + 1e-9);
      }
    }
  });

  it("falls back to a full stretch for invalid aspects", () => {
    for (const bad of [0, -1, NaN, Infinity]) {
      expect(computeFit(bad, W169, "contain").quad).toEqual([1, 1]);
      expect(computeFit(W169, bad, "cover").repeat).toEqual([1, 1]);
    }
  });
});