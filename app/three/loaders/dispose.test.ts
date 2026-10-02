import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { disposeObject } from "./dispose";

function watch(target: { addEventListener: (type: "dispose", fn: () => void) => void }) {
  const w = { n: 0 };
  target.addEventListener("dispose", () => {
    w.n += 1;
  });
  return w;
}

describe("disposeObject", () => {
  it("disposes a geometry and material shared by several meshes exactly once", () => {
    const geo = new THREE.BoxGeometry();
    const mat = new THREE.MeshStandardMaterial();
    const g = watch(geo);
    const m = watch(mat);
    const root = new THREE.Group();
    root.add(new THREE.Mesh(geo, mat), new THREE.Mesh(geo, mat));

    disposeObject(root);

    expect(g.n).toBe(1);
    expect(m.n).toBe(1);
  });

  it("disposes every material of a multi-material mesh and nested children", () => {
    const a = new THREE.MeshBasicMaterial();
    const b = new THREE.MeshBasicMaterial();
    const wa = watch(a);
    const wb = watch(b);
    const child = new THREE.Group().add(new THREE.Mesh(new THREE.BoxGeometry(), [a, b]));
    disposeObject(new THREE.Group().add(child));
    expect([wa.n, wb.n]).toEqual([1, 1]);
  });

  it("disposes material textures once, even when two materials share them", () => {
    const shared = new THREE.Texture();
    const normal = new THREE.Texture();
    const ws = watch(shared);
    const wn = watch(normal);
    const root = new THREE.Group();
    root.add(
      new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ map: shared, normalMap: normal })),
      new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ map: shared })),
    );

    disposeObject(root);

    expect(ws.n).toBe(1);
    expect(wn.n).toBe(1);
  });

  it("copes with lights, empties and empty roots", () => {
    const root = new THREE.Group();
    root.add(new THREE.PointLight(), new THREE.Object3D());
    expect(() => disposeObject(root)).not.toThrow();
    expect(() => disposeObject(new THREE.Group())).not.toThrow();
  });
});