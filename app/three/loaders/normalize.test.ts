import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { largestDimension, measureModel, placementFor } from "./normalize";

function boxMesh(w: number, h: number, d: number, at: [number, number, number]) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d));
  m.position.set(...at);
  return m;
}

describe("measureModel", () => {
  it("measures visible meshes and counts triangles", () => {
    const root = new THREE.Group();
    root.add(boxMesh(2, 4, 6, [10, 5, -7]));
    const m = measureModel(root)!;
    expect(m.min).toEqual([9, 3, -10]);
    expect(m.max).toEqual([11, 7, -4]);
    expect(m.meshCount).toBe(1);
    expect(m.triangleCount).toBe(12);
  });

  it("ignores hidden meshes, non-meshes and far-away helpers", () => {
    const root = new THREE.Group();
    root.add(boxMesh(1, 1, 1, [0, 0, 0]));
    const hidden = boxMesh(1, 1, 1, [1000, 0, 0]);
    hidden.visible = false;
    root.add(hidden);
    const light = new THREE.PointLight();
    light.position.set(-5000, 0, 0);
    root.add(light, new THREE.Object3D());
    expect(largestDimension(measureModel(root)!)).toBeCloseTo(1, 5);
  });

  it("returns null when nothing is measurable", () => {
    expect(measureModel(new THREE.Group())).toBeNull();
    const nan = new THREE.Mesh(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([NaN, 0, 0, 1, 1, 1, 2, 2, 2], 3)));
    expect(measureModel(new THREE.Group().add(nan))).toBeNull();
  });
});

describe("placementFor", () => {
  it("computes scale, centering and real-world size", () => {
    const p = placementFor([-1, 2, -3], [1, 4, 3], "cm");
    expect(p.scale).toBe(0.01);
    expect(p.position[0]).toBeCloseTo(0, 10);
    expect(p.position[1]).toBeCloseTo(-0.02, 10);
    expect(p.position[2]).toBeCloseTo(0, 10);
    expect(p.size[0]).toBeCloseTo(0.02, 10);
    expect(p.size[2]).toBeCloseTo(0.06, 10);
  });

  it("puts an off-center model on the floor, centered, at real size", () => {
    const scene = new THREE.Group();
    scene.add(boxMesh(2000, 3000, 4000, [10000, 5000, -7000])); // a 2 x 3 x 4 m box in mm
    const m = measureModel(scene)!;
    const p = placementFor(m.min, m.max, "mm");

    scene.scale.setScalar(p.scale);
    scene.position.set(...p.position);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    expect(box.min.y).toBeCloseTo(0, 6);
    expect(center.x).toBeCloseTo(0, 6);
    expect(center.z).toBeCloseTo(0, 6);
    expect([size.x, size.y, size.z].map((v) => +v.toFixed(6))).toEqual([2, 3, 4]);
  });
});