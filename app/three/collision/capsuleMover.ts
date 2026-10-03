import * as THREE from "three";
import type { Collider } from "./buildCollider";
import {
  GRAVITY,
  GROUND_PLANE_Y,
  PLAYER_HEIGHT,
  PLAYER_RADIUS,
  SNAP_DOWN,
  STEP_HEIGHT,
  TERMINAL_SPEED,
} from "./constants";
import { classifyNormalY, orientNormal } from "./surface";

/** `position` is the player's FEET. Matches the shape of the `player` object. */
export type Mover = { position: THREE.Vector3; velocity: THREE.Vector3; grounded: boolean };

const MAX_SUBSTEPS = 8;
const MAX_SUBSTEP_DISTANCE = PLAYER_RADIUS * 0.5; // per sub-step, so a thin wall can't be skipped
const WALL_ITERATIONS = 3;
const EPSILON = 1e-5;
const DOWN = new THREE.Vector3(0, -1, 0);

// Scratch objects, reused every frame to avoid garbage.
const segment = new THREE.Line3();
const capsuleBox = new THREE.Box3();
const triPoint = new THREE.Vector3();
const capsulePoint = new THREE.Vector3();
const contact = new THREE.Vector3();
const normal = new THREE.Vector3();
const reference = new THREE.Vector3();
const push = new THREE.Vector3();
const previous = new THREE.Vector3();
const ray = new THREE.Ray(new THREE.Vector3(), DOWN);

/**
 * Pushes `feet` (in place) out of walls, horizontally. The capsule's lower end is raised by
 * STEP_HEIGHT so low steps never count as walls. `totalPush` receives the accumulated push.
 * `previous` is where the player was before this move: normals are oriented toward it, so
 * the result doesn't depend on triangle winding and a thin wall can't let the player through.
 */
function resolveWalls(collider: Collider, feet: THREE.Vector3, from: THREE.Vector3, totalPush: THREE.Vector3): void {
  totalPush.set(0, 0, 0);
  const referenceY = (STEP_HEIGHT + PLAYER_HEIGHT) / 2;

  for (let iteration = 0; iteration < WALL_ITERATIONS; iteration++) {
    segment.start.set(feet.x, feet.y + STEP_HEIGHT + PLAYER_RADIUS, feet.z);
    segment.end.set(feet.x, feet.y + PLAYER_HEIGHT - PLAYER_RADIUS, feet.z);
    capsuleBox.makeEmpty();
    capsuleBox.expandByPoint(segment.start);
    capsuleBox.expandByPoint(segment.end);
    capsuleBox.min.addScalar(-PLAYER_RADIUS);
    capsuleBox.max.addScalar(PLAYER_RADIUS);
    reference.set(from.x, from.y + referenceY, from.z);

    let moved = 0;
    collider.bvh.shapecast({
      intersectsBounds: (box) => box.intersectsBox(capsuleBox),
      intersectsTriangle: (tri) => {
        const distance = tri.closestPointToSegment(segment, triPoint, capsulePoint);
        if (distance >= PLAYER_RADIUS) return false;

        tri.getNormal(normal);
        contact.subVectors(reference, triPoint);
        if (normal.dot(contact) < 0) normal.negate(); // face where the player came from
        if (classifyNormalY(normal.y) === "floor") return false; // the ground probe handles floors

        contact.subVectors(capsulePoint, triPoint);
        if (contact.dot(normal) <= EPSILON) contact.copy(normal); // degenerate, or already behind the plane
        contact.y = 0;
        const length = contact.length();
        if (length < EPSILON) return false; // purely vertical contact (a ceiling): no horizontal push

        contact.multiplyScalar((PLAYER_RADIUS - distance) / length);
        segment.start.add(contact);
        segment.end.add(contact);
        feet.add(contact);
        totalPush.add(contact);
        moved += contact.length();
        return false; // keep going through all candidate triangles
      },
    });

    if (moved < EPSILON) break;
  }
}

/**
 * Height of the ground under (x, z) between `bottom` and `top`, or null. Surfaces steeper than
 * the walkable slope are looked through, so they are never stood on.
 */
function findGroundY(collider: Collider, x: number, z: number, top: number, bottom: number): number | null {
  let modelY: number | null = null;
  let startY = top;

  for (let attempt = 0; attempt < 4; attempt++) {
    const reach = startY - bottom;
    if (reach < 0) break;
    ray.origin.set(x, startY, z);
    const hit = collider.bvh.raycastFirst(ray, THREE.DoubleSide);
    if (!hit || !hit.face || hit.distance > reach) break;

    orientNormal(normal.copy(hit.face.normal), DOWN);
    if (classifyNormalY(normal.y) === "floor") {
      modelY = hit.point.y;
      break;
    }
    startY = hit.point.y - 1e-4; // too steep to stand on: look below it
  }

  const plane = GROUND_PLANE_Y;
  const planeY = plane !== null && plane >= bottom && plane <= top ? plane : null;
  if (modelY === null) return planeY;
  return planeY === null ? modelY : Math.max(modelY, planeY);
}

function substep(collider: Collider, mover: Mover, dt: number): void {
  const { position, velocity } = mover;
  previous.copy(position);

  // 1. Horizontal move, then push out of walls.
  position.x += velocity.x * dt;
  position.z += velocity.z * dt;
  resolveWalls(collider, position, previous, push);

  // Remove the part of the velocity that points into the wall, so the player slides along it.
  if (push.lengthSq() > 1e-12) {
    push.normalize();
    const into = velocity.x * push.x + velocity.z * push.z;
    if (into < 0) {
      velocity.x -= push.x * into;
      velocity.z -= push.z * into;
    }
  }

  // 2. Vertical: gravity when airborne, then find the ground within reach.
  if (mover.grounded) velocity.y = 0;
  else velocity.y = Math.max(velocity.y - GRAVITY * dt, -TERMINAL_SPEED);

  const nextY = position.y + velocity.y * dt;
  const top = Math.max(position.y, nextY) + STEP_HEIGHT;     // can step UP onto anything this much higher
  const bottom = mover.grounded ? nextY - SNAP_DOWN : nextY;  // stick to the ground while walking down
  const groundY = findGroundY(collider, position.x, position.z, top, bottom);

  if (groundY === null) {
    position.y = nextY;
    mover.grounded = false;
  } else {
    position.y = groundY;
    velocity.y = 0;
    mover.grounded = true;
  }
}

/** Advances the player by dt seconds with collision. Splits long moves into safe sub-steps. */
export function stepMover(collider: Collider | null, mover: Mover, dt: number): void {
  if (!(dt > 0)) return;

  if (!collider) {
    mover.position.x += mover.velocity.x * dt;
    mover.position.z += mover.velocity.z * dt;
    return;
  }

  const distance = Math.hypot(mover.velocity.x, mover.velocity.z) * dt;
  const steps = Math.min(MAX_SUBSTEPS, Math.max(1, Math.ceil(distance / MAX_SUBSTEP_DISTANCE)));
  for (let i = 0; i < steps; i++) substep(collider, mover, dt / steps);
}