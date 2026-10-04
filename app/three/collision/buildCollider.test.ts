import { beforeEach, describe, expect, it } from "vitest";
import * as THREE from "three";
import { createSampleBooth } from "../scene/createSampleBooth";
import { buildCollider } from "./buildCollider";
import type { Collider } from "./buildCollider";
import { clearColliderCache, getCollider } from "./colliderCache";
import { classifyNormalY } from "./surface";

type V3 = [number, number, number];

function cast(c: Collider, origin: V3, dir: V3) {
  const ray = new THREE.Ray(new THREE.Vector3(...origin), new THREE.Vector3(...dir).normalize());
  const hit = c.bvh.raycastFirst(ray, THREE.DoubleSide);
  if (!hit || !hit.face) return null;
  return { point: hit.point, normal: hit.face.normal, kind: classifyNormalY(hit.face.normal.y) };
}

function boxAt(x: number, y: number, z: number) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
  m.position.set(x, y, z);
  return m;
}

describe("buildCollider on the sample booth", () => {
  const booth = createSampleBooth();
  const collider = buildCollider(booth)!;

  it("includes every mesh and spans the booth", () => {
    let meshes = 0;
    booth.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) meshes += 1;
    });
    expect(collider.triangleCount).toBe(meshes * 12);
    const size = collider.bounds.getSize(new THREE.Vector3());
    expect([size.x, size.y, size.z].map((n) => +n.toFixed(3))).toEqual([6.1, 3, 5.1]);
  });

  it("finds the floor and each stair tread as floor surfaces", () => {
    const zs = [1.5, -0.1, -0.4, -0.7, -1.5];
    const tops = [0.05, 0.2, 0.35, 0.5, 0.65];
    zs.forEach((z, i) => {
      const hit = cast(collider, [0, 10, z], [0, -1, 0])!;
      expect(hit.point.y).toBeCloseTo(tops[i], 5);
      expect(hit.kind).toBe("floor");
    });
  });

  it("finds a stair riser and the side walls as walls", () => {
    const riser = cast(collider, [0, 0.12, 1.0], [0, 0, -1])!;
    expect(riser.point.z).toBeCloseTo(0.05, 5);
    expect(riser.kind).toBe("wall");

    const wall = cast(collider, [0, 1, -1.0], [-1, 0, 0])!;
    expect(wall.point.x).toBeCloseTo(-2.95, 5);
    expect(wall.kind).toBe("wall");
  });

  it("finds the underside of the door lintel as a ceiling", () => {
    const hit = cast(collider, [0, 1, 2.5], [0, 1, 0])!;
    expect(hit.point.y).toBeCloseTo(2.15, 5);
    expect(hit.kind).toBe("ceiling");
  });

  it("lets a ray pass through the open doorway", () => {
    const hit = cast(collider, [0, 1, 5], [0, 0, -1])!;
    expect(hit.point.z).toBeCloseTo(-2.45, 5); // the back wall, not the front wall
  });
});

describe("buildCollider input handling", () => {
  it("applies world transforms and handles non-indexed geometry", () => {
    const root = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1).toNonIndexed());
    mesh.position.set(5, 0, 0);
    mesh.scale.setScalar(2);
    root.add(mesh);

    const c = buildCollider(root)!;
    expect(c.triangleCount).toBe(12);
    expect(c.bounds.min.x).toBeCloseTo(4, 6);
    expect(c.bounds.max.x).toBeCloseTo(6, 6);
    expect(c.bounds.max.y).toBeCloseTo(1, 6);
  });

  it("ignores hidden meshes, noCollide meshes and counts unsupported ones", () => {
    const root = new THREE.Group();
    root.add(boxAt(0, 0, 0));

    const hidden = boxAt(100, 0, 0);
    hidden.visible = false;
    const helper = boxAt(200, 0, 0);
    helper.userData.noCollide = true;
    const instanced = new THREE.InstancedMesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial(), 2);
    root.add(hidden, helper, instanced);

    const c = buildCollider(root)!;
    expect(c.triangleCount).toBe(12);
    expect(c.bounds.max.x).toBeLessThan(10);
    expect(c.skippedMeshes).toBe(1);
  });

  it("returns null when there is nothing solid", () => {
    expect(buildCollider(new THREE.Group())).toBeNull();
    expect(buildCollider(new THREE.Group().add(new THREE.PointLight()))).toBeNull();
  });

  it("returns null instead of hanging on NaN geometry", () => {
    const g = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([NaN, 0, 0, 1, 1, 1, 2, 2, 2], 3));
    expect(buildCollider(new THREE.Group().add(new THREE.Mesh(g)))).toBeNull();
  });
});

describe("getCollider cache", () => {
  beforeEach(() => clearColliderCache());

  it("reuses the collider for the same key and rebuilds for a new one", () => {
    const root = new THREE.Group().add(boxAt(0, 0, 0));
    const a = getCollider(root, "k1");
    expect(getCollider(root, "k1")).toBe(a);
    expect(getCollider(root, "k2")).not.toBe(a);
  });
});