import { describe, expect, it } from "vitest";
import { stepVelocity, wishVector } from "./movement";
import type { WalkInputState } from "./walkInput";

const input = (p: Partial<WalkInputState>): WalkInputState => ({ forward: false, back: false, left: false, right: false, run: false, ...p });

describe("wishVector", () => {
  it("moves along -Z when facing forward", () => {
    const w = wishVector(input({ forward: true }), 0);
    expect(w.x).toBeCloseTo(0, 10);
    expect(w.z).toBeCloseTo(-1, 10);
  });

  it("strafes right along +X at yaw 0, and backs up opposite to forward", () => {
    const r = wishVector(input({ right: true }), 0);
    expect([r.x, r.z]).toEqual([1, -0].map((n) => expect.closeTo(n, 10)));
    const b = wishVector(input({ back: true }), 0);
    expect(b.z).toBeCloseTo(1, 10);
  });

  it("follows the camera: after turning 90 degrees left, forward is -X and right is -Z", () => {
    const f = wishVector(input({ forward: true }), Math.PI / 2);
    expect(f.x).toBeCloseTo(-1, 10);
    expect(f.z).toBeCloseTo(0, 10);
    const r = wishVector(input({ right: true }), Math.PI / 2);
    expect(r.x).toBeCloseTo(0, 10);
    expect(r.z).toBeCloseTo(-1, 10);
  });

  it("normalizes diagonals", () => {
    const d = wishVector(input({ forward: true, right: true }), 0.7);
    expect(Math.hypot(d.x, d.z)).toBeCloseTo(1, 10);
  });

  it("cancels opposing keys", () => {
    const w = wishVector(input({ forward: true, back: true }), 0);
    expect(w.x).toBeCloseTo(0, 10); // toBeCloseTo treats -0 as 0
    expect(w.z).toBeCloseTo(0, 10);
  });
});

describe("stepVelocity", () => {
  /** Simulates exactly `steps` frames of 1/fps seconds each. */
  const simulate = (steps: number, fps: number, start = { x: 0, z: 0 }, wish = { x: 1, z: 0 }) => {
    const v = { ...start };
    for (let i = 0; i < steps; i++) stepVelocity(v, wish, 4, 1 / fps);
    return v;
  };

  it("reaches the target speed", () => {
    expect(simulate(120, 60).x).toBeCloseTo(4, 6); // 2 s
  });

  it("is frame-rate independent: the same elapsed time gives the same velocity", () => {
    // 0.5 s as 15 frames at 30 fps and as 72 frames at 144 fps
    expect(simulate(15, 30).x).toBeCloseTo(simulate(72, 144).x, 10);
  });

  it("comes to rest when no key is held", () => {
    expect(Math.abs(simulate(60, 60, { x: 4, z: 0 }, { x: 0, z: 0 }).x)).toBeLessThan(1e-5); // 1 s
  });

  it("does nothing for a zero time step", () => {
    const v = { x: 1, z: 2 };
    stepVelocity(v, { x: 1, z: 0 }, 4, 0);
    expect(v).toEqual({ x: 1, z: 2 });
  });
});