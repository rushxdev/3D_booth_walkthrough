import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createSampleBooth } from "../scene/createSampleBooth";
import { buildCollider } from "./buildCollider";
import { findSpawn } from "./spawn";

const slab = (w: number, h: number, d: number, baseY: number) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d));
  m.position.y = baseY + h / 2;
  return m;
};

describe("findSpawn", () => {
  it("falls back to the origin without a collider", () => {
    expect(findSpawn(null)).toEqual([0, 0, 0]);
  });

  it("stands on the surface under the center of the sample booth", () => {
    const [x, y, z] = findSpawn(buildCollider(createSampleBooth()));
    expect(x).toBeCloseTo(0, 6);
    expect(z).toBeCloseTo(0, 6);
    expect(y).toBeCloseTo(0.2, 6); // the first stair tread sits at the booth center
  });

  it("picks the floor, not the roof, of a covered room", () => {
    const room = new THREE.Group();
    room.add(slab(10, 0.1, 10, 0), slab(10, 0.1, 10, 2.5)); // floor and roof
    expect(findSpawn(buildCollider(room))[1]).toBeCloseTo(0.1, 6);
  });
});