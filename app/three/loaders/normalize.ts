import * as THREE from "three";
import { UNIT_TO_METERS } from "./../../lib/units";
import type { Unit } from "./../../lib/units";

export type Vec3 = [number, number, number];

/** Raw measurements of the loaded scene, in the file's own units. Never mutated. */
export type ModelMeasure = {
  min: Vec3;
  max: Vec3;
  meshCount: number;
  triangleCount: number;
};

export type Placement = {
  scale: number;    // uniform, file units -> meters
  position: Vec3;   // moves bbox center to x/z = 0 and its lowest point to y = 0
  size: Vec3;       // real-world W x H x D in meters
};

export function largestDimension(m: Pick<ModelMeasure, "min" | "max">): number {
  return Math.max(m.max[0] - m.min[0], m.max[1] - m.min[1], m.max[2] - m.min[2]);
}

/**
 * Bounding box over visible meshes only (lights, cameras, empties, lines and points
 * are ignored). Returns null when there is nothing measurable.
 * Assumes the root has no transform of its own, which holds for glTF scenes.
 */
export function measureModel(root: THREE.Object3D): ModelMeasure | null {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  const tmp = new THREE.Box3();
  let meshCount = 0;
  let triangleCount = 0;

  root.traverseVisible((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geometry = mesh.geometry;
    if (!geometry?.attributes?.position) return;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    if (!geometry.boundingBox || geometry.boundingBox.isEmpty()) return;

    tmp.copy(geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
    box.union(tmp);
    meshCount += 1;
    triangleCount += (geometry.index ? geometry.index.count : geometry.attributes.position.count) / 3;
  });

  if (meshCount === 0 || box.isEmpty()) return null;

  const min: Vec3 = [box.min.x, box.min.y, box.min.z];
  const max: Vec3 = [box.max.x, box.max.y, box.max.z];
  if (![...min, ...max].every(Number.isFinite)) return null; // NaN vertices
  if (!(largestDimension({ min, max }) > 0)) return null;

  return { min, max, meshCount, triangleCount };
}

/** Derives the transform for a unit. Pure: changing unit just recomputes this from the raw measure. */
export function placementFor(min: Vec3, max: Vec3, unit: Unit): Placement {
  const k = UNIT_TO_METERS[unit];
  const cx = (min[0] + max[0]) / 2;
  const cz = (min[2] + max[2]) / 2;
  return {
    scale: k,
    position: [-cx * k, -min[1] * k, -cz * k],
    size: [(max[0] - min[0]) * k, (max[1] - min[1]) * k, (max[2] - min[2]) * k],
  };
}