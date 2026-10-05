import * as THREE from "three";
import type { Vec3 } from "./../../lib/schema";
import type { Collider } from "../collision/buildCollider";
import { GROUND_PLANE_Y } from "../collision/constants";
import { orientNormal } from "../collision/surface";

export const SURFACE_OFFSET = 0.002; // m: keeps a screen off its surface so it doesn't z-fight

/** A point on a surface and its unit normal, facing the viewer. */
export type SurfaceHit = { point: Vec3; normal: Vec3 };
export type Pose = { position: Vec3; rotation: Vec3 }; // rotation: Euler YXZ, radians

const normal = new THREE.Vector3();
const X = new THREE.Vector3();
const Y = new THREE.Vector3();
const Z = new THREE.Vector3();
const matrix = new THREE.Matrix4();
const euler = new THREE.Euler();

/** First surface along a ray: the model (BVH) or the ground plane, whichever is nearer. */
export function surfaceHit(ray: THREE.Ray, collider: Collider | null): SurfaceHit | null {
  let best: { distance: number; point: Vec3; normal: Vec3 } | null = null;

  const hit = collider?.bvh.raycastFirst(ray, THREE.DoubleSide);
  if (hit?.face) {
    normal.copy(hit.face.normal).normalize();
    orientNormal(normal, ray.direction); // always face the viewer, whatever the triangle winding
    best = { distance: hit.distance, point: [hit.point.x, hit.point.y, hit.point.z], normal: [normal.x, normal.y, normal.z] };
  }

  const plane = GROUND_PLANE_Y;
  if (plane !== null && ray.direction.y < -1e-6) {
    const t = (plane - ray.origin.y) / ray.direction.y;
    if (t > 0 && (best === null || t < best.distance)) {
      best = {
        distance: t,
        point: [ray.origin.x + ray.direction.x * t, plane, ray.origin.z + ray.direction.z * t],
        normal: [0, 1, 0],
      };
    }
  }
  return best ? { point: best.point, normal: best.normal } : null;
}

/**
 * Pose that lays a screen flat on a surface: front along the normal, 2 mm off it. The top edge
 * points up on walls. On floors and ceilings it points where the viewer is looking.
 */
export function placementPose(hit: SurfaceHit, cameraForward: Vec3): Pose {
  Z.set(...hit.normal).normalize();

  const onWall = Math.abs(Z.y) < 0.98;
  if (onWall) Y.set(0, 1, 0);
  else Y.set(cameraForward[0], 0, cameraForward[2]);
  if (Y.lengthSq() < 1e-6) Y.set(0, 0, -1); // looking straight down: pick a heading

  Y.addScaledVector(Z, -Y.dot(Z)).normalize(); // make it perpendicular to the normal
  X.crossVectors(Y, Z);
  matrix.makeBasis(X, Y, Z);
  euler.setFromRotationMatrix(matrix, "YXZ");

  return {
    position: [hit.point[0] + Z.x * SURFACE_OFFSET, hit.point[1] + Z.y * SURFACE_OFFSET, hit.point[2] + Z.z * SURFACE_OFFSET],
    rotation: [euler.x, euler.y, euler.z],
  };
}

export function poseOnSurface(ray: THREE.Ray, collider: Collider | null, cameraForward: Vec3): Pose | null {
  const hit = surfaceHit(ray, collider);
  return hit ? placementPose(hit, cameraForward) : null;
}