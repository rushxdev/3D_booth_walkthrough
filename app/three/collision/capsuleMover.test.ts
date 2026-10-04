import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createSampleBooth } from "../scene/createSampleBooth";
import { buildCollider } from "./buildCollider";
import { stepMover } from "./capsuleMover";
import type { Mover } from "./capsuleMover";

const collider = buildCollider(createSampleBooth())!;
type V3 = [number, number, number];

function mover(start: V3, grounded = true): Mover {
  return { position: new THREE.Vector3(...start), velocity: new THREE.Vector3(), grounded };
}

/** Holds a horizontal velocity for a whole number of frames, like held keys. */
function walk(start: V3, vx: number, vz: number, seconds: number, dt = 1 / 60, c = collider) {
  const m = mover(start);
  const trail: THREE.Vector3[] = [];
  const grounded: boolean[] = [];
  for (let i = 0; i < Math.round(seconds / dt); i++) {
    m.velocity.x = vx;
    m.velocity.z = vz;
    stepMover(c, m, dt);
    trail.push(m.position.clone());
    grounded.push(m.grounded);
  }
  return { m, trail, grounded };
}

describe("walking on flat ground", () => {
  it("covers the expected distance and stays on the floor", () => {
    const { m } = walk([2, 0.05, 1], 0, -1, 1);
    expect(m.position.z).toBeCloseTo(0, 5);
    expect(m.position.y).toBeCloseTo(0.05, 6);
    expect(m.grounded).toBe(true);
  });
});

describe("walls", () => {
  for (const dt of [1 / 60, 0.05]) {
    it(`stops at the back wall without passing it (dt = ${dt.toFixed(3)})`, () => {
      const { m, trail } = walk([2, 0.05, 1], 0, -2, 3, dt);
      expect(m.position.z).toBeCloseTo(-2.15, 2); // inner face -2.45 + radius 0.3
      for (const p of trail) expect(p.z).toBeGreaterThan(-2.4);
      expect(m.position.y).toBeCloseTo(0.05, 6);
    });
  }

  it("removes the velocity pointing into the wall", () => {
    const { m } = walk([2, 0.05, 1], 0, -2, 3);
    expect(m.velocity.z).toBeCloseTo(0, 6);
  });

  it("slides along a wall when pushing diagonally into it", () => {
    const { m } = walk([1.8, 0.05, 0.5], 1.5, -1.5, 1);
    expect(m.position.x).toBeCloseTo(2.65, 2); // inner face 2.95 - radius
    expect(m.position.z).toBeCloseTo(-1.0, 2); // full speed along the wall
  });

  it("is blocked by something taller than a step, like the platform side", () => {
    const { m } = walk([2.3, 0.05, -1.5], -2, 0, 2);
    expect(m.position.x).toBeCloseTo(1.8, 2); // platform edge 1.5 + radius
    expect(m.position.y).toBeCloseTo(0.05, 6);
  });

  it("passes through the 1.2 m doorway", () => {
    const { m } = walk([0, 0.05, 4], 0, -2, 1.5);
    expect(m.position.z).toBeLessThan(2.0); // inside
    expect(m.position.x).toBeCloseTo(0, 6);
  });
});

describe("stairs", () => {
  it("climbs the three steps onto the platform, one riser at a time", () => {
    const { m, trail } = walk([0, 0.05, 1.5], 0, -1.5, 3);

    expect(m.position.y).toBeCloseTo(0.65, 6);
    expect(m.grounded).toBe(true);
    expect(m.position.z).toBeCloseTo(-2.15, 2);

    let biggestRise = 0;
    for (let i = 1; i < trail.length; i++) biggestRise = Math.max(biggestRise, trail[i].y - trail[i - 1].y);
    expect(biggestRise).toBeLessThanOrEqual(0.15 + 1e-6);

    for (const tread of [0.2, 0.35, 0.5]) {
      expect(trail.some((p) => Math.abs(p.y - tread) < 1e-6)).toBe(true);
    }
  });

  it("walks back down the stairs without going airborne", () => {
    const up = walk([0, 0.05, 1.5], 0, -1.5, 3).m;
    const { m, grounded } = walk([up.position.x, up.position.y, -1.5], 0, 1.5, 2);
    expect(m.position.y).toBeCloseTo(0.05, 6);
    expect(grounded.every(Boolean)).toBe(true); // snapped to each tread
  });
});

describe("gravity and ledges", () => {
  it("falls off the platform edge and lands on the floor", () => {
    const { m, trail, grounded } = walk([1.2, 0.65, -1.5], 0, 1.5, 1.5);
    expect(grounded.some((g) => !g)).toBe(true); // was airborne at some point
    expect(m.position.y).toBeCloseTo(0.05, 6);
    expect(m.grounded).toBe(true);
    expect(m.position.z).toBeGreaterThan(-0.85); // out past the platform
    for (const p of trail) expect(p.y).toBeGreaterThanOrEqual(0.05 - 1e-6);
  });

  it("never falls through the floor, even on a long frame", () => {
    const m = mover([2, 5, 1], false);
    for (let i = 0; i < 100 && !m.grounded; i++) {
      stepMover(collider, m, 0.05);
      expect(m.position.y).toBeGreaterThanOrEqual(0.05 - 1e-6);
    }
    expect(m.grounded).toBe(true);
    expect(m.position.y).toBeCloseTo(0.05, 6);
  });

  it("caps the fall speed", () => {
    const m = mover([2, 500, 1], false);
    for (let i = 0; i < 200; i++) stepMover(collider, m, 1 / 60);
    expect(m.velocity.y).toBeGreaterThanOrEqual(-15 - 1e-9);
  });
});

describe("models without a floor", () => {
  const wallOnly = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.2));
  wallOnly.position.y = 1.5; // y from 0 to 3
  const bare = buildCollider(new THREE.Group().add(wallOnly))!;

  it("still stands on the ground plane", () => {
    const m = mover([0, 3, 3], false);
    for (let i = 0; i < 200 && !m.grounded; i++) stepMover(bare, m, 1 / 60);
    expect(m.grounded).toBe(true);
    expect(m.position.y).toBeCloseTo(0, 6);
  });

  it("is still stopped by the wall", () => {
    const { m } = walk([0, 0, 3], 0, -2, 3, 1 / 60, bare);
    expect(m.position.z).toBeCloseTo(0.4, 2); // face at 0.1 + radius
  });
});

describe("without a collider", () => {
  it("moves freely", () => {
    const m = mover([0, 0, 0]);
    m.velocity.z = 1.5;
    stepMover(null, m, 1);
    expect(m.position.z).toBeCloseTo(1.5, 6);
  });
});