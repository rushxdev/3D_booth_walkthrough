import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createSampleBooth } from "./createSampleBooth";

const booth = createSampleBooth();
booth.updateMatrixWorld(true);

function firstHit(origin: [number, number, number], dir: [number, number, number]) {
  const rc = new THREE.Raycaster(new THREE.Vector3(...origin), new THREE.Vector3(...dir));
  return rc.intersectObject(booth, true)[0];
}

/** Height of the topmost surface above (x, z). Only valid where nothing overhangs. */
function topSurfaceY(x: number, z: number): number | undefined {
  return firstHit([x, 10, z], [0, -1, 0])?.point.y;
}

/** Walk from outside the front wall toward the back wall at a given x and height. */
function walkIn(x: number, y: number) {
  return firstHit([x, y, 5], [0, 0, -1])?.point.z;
}

describe("createSampleBooth", () => {
  it("has real-world dimensions and sits on y = 0", () => {
    const box = new THREE.Box3().setFromObject(booth);
    const size = box.getSize(new THREE.Vector3());
    expect(size.x).toBeCloseTo(6.1, 5);
    expect(size.y).toBeCloseTo(3.0, 5);
    expect(size.z).toBeCloseTo(5.1, 5);
    expect(box.min.y).toBeCloseTo(0, 5);
  });

  it("has stairs rising 0.15 m per step up to the platform", () => {
    const heights = [1.5, -0.1, -0.4, -0.7, -1.5].map((z) => topSurfaceY(0, z));
    const expected = [0.05, 0.2, 0.35, 0.5, 0.65];
    heights.forEach((h, i) => expect(h).toBeCloseTo(expected[i], 5));
  });

  describe("doorway", () => {
    it("lets a person walk in: head-height rays pass through the opening", () => {
      // Hit the inside face of the back wall (z = -2.45), not the front wall (z = 2.55)
      expect(walkIn(0, 1.0)).toBeCloseTo(-2.45, 5);
      expect(walkIn(0, 2.0)).toBeCloseTo(-2.45, 5); // below the lintel (2.15 m)
    });

    it("is 1.2 m wide: passes at the jambs, blocked just outside", () => {
      expect(walkIn(0.55, 1.0)).toBeCloseTo(-2.45, 5);
      expect(walkIn(-0.55, 1.0)).toBeCloseTo(-2.45, 5);
      expect(walkIn(0.65, 1.0)).toBeCloseTo(2.55, 5);
      expect(walkIn(-0.65, 1.0)).toBeCloseTo(2.55, 5);
    });

    it("has a lintel at 2.15 m that blocks above it", () => {
      expect(walkIn(0, 2.3)).toBeCloseTo(2.55, 5);
    });

    it("has only the floor slab under the opening", () => {
      // Start below the lintel so the ray can't land on top of it
      expect(firstHit([0, 2.0, 2.5], [0, -1, 0])?.point.y).toBeCloseTo(0.05, 5);
    });
  });
});