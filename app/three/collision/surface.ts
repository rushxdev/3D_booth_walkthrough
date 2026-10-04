import type * as THREE from "three";
import { CEILING_MAX_NY, FLOOR_MIN_NY } from "./constants";

export type SurfaceKind = "floor" | "wall" | "ceiling";

/** Classifies a surface by the Y component of its (unit) normal. */
export function classifyNormalY(ny: number): SurfaceKind {
  if (ny >= FLOOR_MIN_NY) return "floor";
  if (ny <= CEILING_MAX_NY) return "ceiling";
  return "wall";
}

/**
 * Flips `normal` (in place) so it faces against `direction`, i.e. toward whoever
 * is moving along it. Makes classification independent of triangle winding.
 */
export function orientNormal(normal: THREE.Vector3, direction: THREE.Vector3): THREE.Vector3 {
  if (normal.dot(direction) > 0) normal.negate();
  return normal;
}