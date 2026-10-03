import * as THREE from "three";
import type { Vec3 } from "../loaders/normalize";
import type { Collider } from "./buildCollider";

/**
 * Where the player's feet start: the bounds center, on the first surface found
 * below 1 m above the lowest point. That skips roofs and upper floors.
 * 5.9 improves this (headroom check, nearby candidates, doorway).
 */
export function findSpawn(collider: Collider | null): Vec3 {
  if (!collider) return [0, 0, 0];
  const { min, max } = collider.bounds;
  const x = (min.x + max.x) / 2;
  const z = (min.z + max.z) / 2;
  const ray = new THREE.Ray(new THREE.Vector3(x, min.y + 1, z), new THREE.Vector3(0, -1, 0));
  const hit = collider.bvh.raycastFirst(ray, THREE.DoubleSide);
  return [x, hit ? hit.point.y : min.y, z];
}