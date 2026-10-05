import * as THREE from "three";
import type { Vec3 } from "../loaders/normalize";
import type { Collider } from "./buildCollider";
import { GROUND_PLANE_Y, PLAYER_HEIGHT, PLAYER_RADIUS } from "./constants";
import { classifyNormalY, orientNormal } from "./surface";

const RING_STEP = 0.75;
const RING_POINTS = 8;
const MAX_RINGS = 12;
const CLEARANCE = PLAYER_RADIUS + 0.05;
const INSIDE_PROBE = 3; // a back face this close means the spot is inside a solid
const CLEARANCE_HEIGHTS = [0.6, 1.3];

type Quality = { frontFloor: boolean; headroom: boolean };

/** Tried in this order for each group of spots. The last level accepts a low ceiling. */
const QUALITY: Quality[] = [
  { frontFloor: true, headroom: true },
  { frontFloor: false, headroom: true },
  { frontFloor: false, headroom: false },
];

const DOWN = new THREE.Vector3(0, -1, 0);
const UP = new THREE.Vector3(0, 1, 0);
const SIDES = Array.from({ length: 8 }, (_, i) => new THREE.Vector3(Math.cos((i * Math.PI) / 4), 0, Math.sin((i * Math.PI) / 4)));
const ray = new THREE.Ray();
const normal = new THREE.Vector3();

function cast(c: Collider, x: number, y: number, z: number, dir: THREE.Vector3) {
  ray.origin.set(x, y, z);
  ray.direction.copy(dir);
  return c.bvh.raycastFirst(ray, THREE.DoubleSide);
}

/**
 * Floor height if a player can stand at (x, z) at this quality, else null.
 * frontFloor: the floor triangle must face up (trusts winding); otherwise any winding is accepted.
 * Standing inside a solid (back faces close by) is rejected at every level.
 */
function checkSpot(c: Collider, x: number, z: number, q: Quality): number | null {
  const hit = cast(c, x, c.bounds.min.y + 1, z, DOWN);
  let floorY: number;
  if (hit?.face) {
    normal.copy(hit.face.normal);
    if (!q.frontFloor) orientNormal(normal, DOWN);
    if (classifyNormalY(normal.y) !== "floor") return null;
    floorY = hit.point.y;
  } else if (GROUND_PLANE_Y !== null) {
    floorY = GROUND_PLANE_Y;
  } else {
    return null;
  }

  if (q.headroom) {
    const above = cast(c, x, floorY + 0.02, z, UP);
    if (above && above.distance < PLAYER_HEIGHT - 0.02) return null;
  }

  for (const h of CLEARANCE_HEIGHTS) {
    for (const dir of SIDES) {
      const side = cast(c, x, floorY + h, z, dir);
      if (!side?.face) continue;
      if (side.distance < CLEARANCE) return null;
      if (side.distance < INSIDE_PROBE && side.face.normal.dot(dir) > 0) return null; // inside a solid
    }
  }
  return floorY;
}

function candidateSpots(cx: number, cz: number, maxRadius: number): Array<[number, number]> {
  const spots: Array<[number, number]> = [[cx, cz]];
  const rings = Math.min(MAX_RINGS, Math.ceil(maxRadius / RING_STEP));
  for (let ring = 1; ring <= rings; ring++) {
    for (let i = 0; i < RING_POINTS; i++) {
      const angle = ring * 0.4 + (i * 2 * Math.PI) / RING_POINTS; // staggered per ring
      spots.push([cx + Math.cos(angle) * ring * RING_STEP, cz + Math.sin(angle) * ring * RING_STEP]);
    }
  }
  return spots;
}

/**
 * Where the player's feet start: the nearest valid standing spot to `near` (default: the
 * bounds center). Inside the model's footprint is preferred when `near` is inside it.
 */
export function findSpawn(collider: Collider | null, near?: { x: number; z: number }): Vec3 {
  if (!collider) return [0, 0, 0];
  const { min, max } = collider.bounds;
  const cx = near?.x ?? (min.x + max.x) / 2;
  const cz = near?.z ?? (min.z + max.z) / 2;
  const inside = ([x, z]: [number, number]) => x >= min.x && x <= max.x && z >= min.z && z <= max.z;

  const spots = candidateSpots(cx, cz, Math.max(max.x - min.x, max.z - min.z) / 2 + RING_STEP);
  const groups = inside([cx, cz]) ? [spots.filter(inside), spots.filter((s) => !inside(s))] : [spots];

  for (const group of groups) {
    for (const quality of QUALITY) {
      for (const [x, z] of group) {
        const y = checkSpot(collider, x, z, quality);
        if (y !== null) return [x, y, z];
      }
    }
  }


  const hit = cast(collider, cx, min.y + 1, cz, DOWN); // nothing fully valid: best effort
  return [cx, hit ? hit.point.y : min.y, cz];
}