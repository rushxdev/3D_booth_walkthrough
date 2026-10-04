import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createSampleBooth } from "../scene/createSampleBooth";
import { buildCollider } from "./buildCollider";
import { findSpawn } from "./spawn";

const box = (w: number, h: number, d: number, x: number, baseY: number, z: number) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d));
  m.position.set(x, baseY + h / 2, z);
  return m;
};
const room = (...meshes: THREE.Mesh[]) => buildCollider(new THREE.Group().add(...meshes));
const floor = () => box(10, 0.1, 10, 0, 0, 0);

describe("findSpawn", () => {
  it("falls back to the origin without a collider", () => {
    expect(findSpawn(null)).toEqual([0, 0, 0]);
  });

  it("starts at the center of the sample booth, on the first tread", () => {
    const [x, y, z] = findSpawn(buildCollider(createSampleBooth()));
    expect([x, y, z].map((n) => +n.toFixed(6))).toEqual([0, 0.2, 0]);
  });

  it("picks the floor, not the roof, of a covered room", () => {
    expect(findSpawn(room(floor(), box(10, 0.1, 10, 0, 2.5, 0)))[1]).toBeCloseTo(0.1, 6);
  });

  it("does not spawn inside a pillar at the center", () => {
    const [x, y, z] = findSpawn(room(floor(), box(1, 3, 1, 0, 0, 0)));
    expect(Math.hypot(x, z)).toBeGreaterThanOrEqual(0.85); // pillar half-width + clearance
    expect(y).toBeCloseTo(0.1, 6);
  });

  it("falls back to the floor when no spot has headroom", () => {
    expect(findSpawn(room(floor(), box(10, 0.1, 10, 0, 1.5, 0)))).toEqual([0, expect.closeTo(0.1, 6), 0]);
  });

  it("copes with a floor whose triangles face down", () => {
    const geometry = new THREE.PlaneGeometry(10, 10).rotateX(Math.PI / 2); // normal now points down
    expect(findSpawn(room(new THREE.Mesh(geometry)))[1]).toBeCloseTo(0, 6);
  });

  it("honors a requested point, keeping clear of walls", () => {
    const collider = buildCollider(createSampleBooth());
    const open = findSpawn(collider, { x: 2, z: 1 });
    expect([open[0], open[2]]).toEqual([2, 1]);

    const nearWall = findSpawn(collider, { x: 2.9, z: 0 }); // wall face at 2.95
    expect(nearWall[0]).toBeLessThanOrEqual(2.6 + 1e-6);

    const outside = findSpawn(collider, { x: 10, z: 0 }); // off the model: stays there, on the ground
    expect([outside[0], outside[1]]).toEqual([10, 0]);
  });
});