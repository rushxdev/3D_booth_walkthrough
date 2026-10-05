import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createSampleBooth } from "../scene/createSampleBooth";
import { buildCollider } from "../collision/buildCollider";
import { isClick, pointerToNdc, resolvePick } from "./picking";

describe("isClick", () => {
  it("treats a small movement as a click and a larger one as a drag", () => {
    expect(isClick({ x: 10, y: 10 }, { x: 12, y: 11 })).toBe(true);
    expect(isClick({ x: 10, y: 10 }, { x: 30, y: 10 })).toBe(false);
  });
});

describe("resolvePick", () => {
  const hit = { id: "a", distance: 5, locked: false };

  it("selects a visible screen", () => {
    expect(resolvePick(hit, null)).toEqual({ kind: "select", id: "a" });
    expect(resolvePick(hit, 5.01)).toEqual({ kind: "select", id: "a" }); // wall just behind it
    expect(resolvePick(hit, 4.99)).toEqual({ kind: "select", id: "a" }); // within the mounting tolerance
  });
  it("treats a wall clearly in front as an empty click", () => {
    expect(resolvePick(hit, 3)).toEqual({ kind: "none" });
  });
  it("treats no screen as an empty click", () => {
    expect(resolvePick(null, 3)).toEqual({ kind: "none" });
  });
  it("blocks locked screens without selecting them", () => {
    expect(resolvePick({ ...hit, locked: true }, null)).toEqual({ kind: "blocked" });
  });
});

describe("picking against the sample booth", () => {
  const collider = buildCollider(createSampleBooth())!;

  function screenAt(z: number) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial()); // front side only
    m.scale.set(1.6, 0.9, 1);
    m.position.set(0, 1.5, z);
    m.updateMatrixWorld(true);
    return m;
  }

  /** Click straight through the doorway toward the back wall, at screen height. */
  function click(screen: THREE.Mesh) {
    const raycaster = new THREE.Raycaster(new THREE.Vector3(0, 1.5, 5), new THREE.Vector3(0, 0, -1));
    const screenDistance = raycaster.intersectObject(screen)[0]?.distance;
    const modelDistance = collider.bvh.raycastFirst(raycaster.ray, THREE.DoubleSide)?.distance ?? null;
    return resolvePick(screenDistance === undefined ? null : { id: "s", distance: screenDistance, locked: false }, modelDistance);
  }

  it("selects a screen mounted 2 mm off the back wall", () => {
    expect(click(screenAt(-2.448))).toEqual({ kind: "select", id: "s" });
  });
  it("does not select a screen hidden behind the back wall", () => {
    expect(click(screenAt(-2.8))).toEqual({ kind: "none" });
  });
  it("ignores a screen seen from behind", () => {
    const back = screenAt(-2.448);
    back.rotation.y = Math.PI;
    back.updateMatrixWorld(true);
    expect(click(back)).toEqual({ kind: "none" });
  });
});

describe("pointerToNdc", () => {
  const rect = { left: 100, top: 50, width: 400, height: 200 };
  it("maps the center to the origin and the corners to +-1, with y pointing up", () => {
    const v = new THREE.Vector2();
    pointerToNdc(300, 150, rect, v);
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(0);
    expect(pointerToNdc(100, 50, rect, v).toArray()).toEqual([-1, 1]);
    expect(pointerToNdc(500, 250, rect, v).toArray()).toEqual([1, -1]);
  });
});