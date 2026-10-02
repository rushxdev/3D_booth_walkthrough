import { describe, expect, it } from "vitest";
import { computeFraming, viewLimits } from "./framing";

const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe("computeFraming", () => {
  const min: [number, number, number] = [-3, 0, -2.5];
  const max: [number, number, number] = [3, 3, 2.5];

  it("targets the bounds center and looks from above and a corner", () => {
    const f = computeFraming(min, max, 50, 1.6);
    expect(f.target).toEqual([0, 1.5, 0]);
    expect(f.position[1]).toBeGreaterThan(f.target[1]);
    expect(f.position[0]).toBeGreaterThan(0);
    expect(f.position[2]).toBeGreaterThan(0);
  });

  it("places the camera so the bounding sphere fits the narrower field of view", () => {
    const f = computeFraming(min, max, 50, 1.6);
    expect(dist(f.position, f.target)).toBeCloseTo(f.distance, 6);
    const fit = (50 * Math.PI) / 180; // vertical is narrower at aspect 1.6
    expect(f.radius / f.distance).toBeLessThan(Math.sin(fit / 2));
  });

  it("backs off further for a portrait viewport", () => {
    const wide = computeFraming(min, max, 50, 1.6);
    const tall = computeFraming(min, max, 50, 0.5);
    expect(tall.distance).toBeGreaterThan(wide.distance);
  });

  it("survives bad aspect and tiny bounds", () => {
    const f = computeFraming([0, 0, 0], [0.01, 0.01, 0.01], 50, NaN);
    expect(Number.isFinite(f.distance)).toBe(true);
    expect(f.radius).toBe(0.5);
  });
});

describe("viewLimits", () => {
  it("clamps near plane and scales far plane with the model", () => {
    expect(viewLimits(1).near).toBe(0.02);
    expect(viewLimits(100_000).near).toBe(2);
    expect(viewLimits(10).far).toBe(600);
    expect(viewLimits(1).far).toBe(200);
  });

  it("always allows zooming out past the framing distance, even on a narrow viewport", () => {
    for (const r of [0.5, 4, 40, 400]) {
      const f = computeFraming([-r, 0, -r], [r, r, r], 50, 0.3);
      expect(viewLimits(f.radius).maxDistance).toBeGreaterThan(f.distance);
    }
  });
});