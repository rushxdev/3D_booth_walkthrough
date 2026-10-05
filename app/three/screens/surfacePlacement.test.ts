import { describe, expect, it } from "vitest";
import * as THREE from "three";
import type { Vec3 } from "./../../lib/schema";
import { buildCollider } from "../collision/buildCollider";
import { createSampleBooth } from "../scene/createSampleBooth";
import { SURFACE_OFFSET, placementPose, poseOnSurface, surfaceHit } from "./surfacePlacement";

const collider = buildCollider(createSampleBooth())!;
const ray = (origin: Vec3, dir: Vec3) => new THREE.Ray(new THREE.Vector3(...origin), new THREE.Vector3(...dir).normalize());

/** Where a screen's front (+Z) and top (+Y) point for a rotation. */
function axes(rotation: Vec3) {
  const e = new THREE.Euler(rotation[0], rotation[1], rotation[2], "YXZ");
  return { front: new THREE.Vector3(0, 0, 1).applyEuler(e), top: new THREE.Vector3(0, 1, 0).applyEuler(e) };
}
function expectVec(v: THREE.Vector3, [x, y, z]: Vec3) {
  expect(v.x).toBeCloseTo(x, 6);
  expect(v.y).toBeCloseTo(y, 6);
  expect(v.z).toBeCloseTo(z, 6);
}

describe("surfaceHit", () => {
  it("hits the inner face of the back wall, facing the viewer", () => {
    const hit = surfaceHit(ray([0, 1.5, 5], [0, 0, -1]), collider)!;
    expect(hit.point[2]).toBeCloseTo(-2.45, 6);
    expect(hit.normal[2]).toBeCloseTo(1, 6);
  });

  it("faces outward when the viewer is outside the wall", () => {
    const hit = surfaceHit(ray([0, 1.5, -6], [0, 0, 1]), collider)!;
    expect(hit.point[2]).toBeCloseTo(-2.55, 6);
    expect(hit.normal[2]).toBeCloseTo(-1, 6);
  });

  it("hits the floor slab inside the booth", () => {
    const hit = surfaceHit(ray([2, 3, 1], [0, -1, 0]), collider)!;
    expect(hit.point[1]).toBeCloseTo(0.05, 6);
    expect(hit.normal).toEqual([0, 1, 0]);
  });

  it("falls back to the ground plane away from the model, and misses when looking up", () => {
    const ground = surfaceHit(ray([10, 3, 10], [0, -1, 0]), collider)!;
    expect(ground.point[1]).toBe(0);
    expect(ground.normal).toEqual([0, 1, 0]);
    expect(surfaceHit(ray([10, 3, 10], [0, 1, 0]), collider)).toBeNull();
  });
});

describe("placementPose", () => {
  const forward: Vec3 = [0, 0, -1]; // the viewer faces -Z

  const cases: Array<{ name: string; normal: Vec3; top: Vec3 }> = [
    { name: "back wall", normal: [0, 0, 1], top: [0, 1, 0] },
    { name: "left wall", normal: [1, 0, 0], top: [0, 1, 0] },
    { name: "right wall", normal: [-1, 0, 0], top: [0, 1, 0] },
    { name: "front wall", normal: [0, 0, -1], top: [0, 1, 0] },
    { name: "floor", normal: [0, 1, 0], top: [0, 0, -1] },
    { name: "ceiling", normal: [0, -1, 0], top: [0, 0, -1] },
  ];

  it.each(cases)("$name: front follows the normal and the top edge reads correctly", ({ normal, top }) => {
    const pose = placementPose({ point: [0, 0, 0], normal }, forward);
    const a = axes(pose.rotation);
    expectVec(a.front, normal);
    expectVec(a.top, top);
  });

  it("sits 2 mm off the surface, along the normal", () => {
    const pose = placementPose({ point: [1, 2, 3], normal: [0, 0, 1] }, forward);
    expect(pose.position[0]).toBeCloseTo(1, 10);
    expect(pose.position[2]).toBeCloseTo(3 + SURFACE_OFFSET, 10);
  });

  it("leaves a wall screen unrotated when the wall faces +Z", () => {
    const pose = placementPose({ point: [0, 0, 0], normal: [0, 0, 1] }, forward);
    pose.rotation.forEach((r) => expect(r).toBeCloseTo(0, 10));
  });

  it("handles a sloped surface: front along the normal, top perpendicular to it and pointing up", () => {
    const s = Math.SQRT1_2;
    const a = axes(placementPose({ point: [0, 0, 0], normal: [0, s, s] }, forward).rotation);
    expectVec(a.front, [0, s, s]);
    expect(a.top.dot(a.front)).toBeCloseTo(0, 6);
    expect(a.top.y).toBeGreaterThan(0);
  });

  it("copes with looking straight down at a floor", () => {
    const a = axes(placementPose({ point: [0, 0, 0], normal: [0, 1, 0] }, [0, -1, 0]).rotation);
    expect(a.top.y).toBeCloseTo(0, 6);
    expect(a.top.length()).toBeCloseTo(1, 6);
  });
});

describe("poseOnSurface", () => {
  it("returns a pose on a hit and null on a miss", () => {
    expect(poseOnSurface(ray([0, 1.5, 5], [0, 0, -1]), collider, [0, 0, -1])).not.toBeNull();
    expect(poseOnSurface(ray([10, 3, 10], [0, 1, 0]), collider, [0, 0, -1])).toBeNull();
  });
});