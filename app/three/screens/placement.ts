import * as THREE from "three";
import type { Vec3 } from "./../../lib/schema";

const v = new THREE.Vector3();
const e = new THREE.Euler();

/** Moves a position by `distance` meters along the screen's own right axis (Euler XYZ). */
export function offsetAlongRight(position: Vec3, rotation: Vec3, distance: number): Vec3 {
  v.set(1, 0, 0).applyEuler(e.set(rotation[0], rotation[1], rotation[2]));
  return [position[0] + v.x * distance, position[1] + v.y * distance, position[2] + v.z * distance];
}

/** Yaw (about Y) that turns a screen's front (+Z) toward the viewer. */
export function yawToward(from: { x: number; z: number }, viewer: { x: number; z: number }): number {
  const dx = viewer.x - from.x;
  const dz = viewer.z - from.z;
  return Math.hypot(dx, dz) < 1e-6 ? 0 : Math.atan2(dx, dz);
}

/** Center position and rotation for a new screen at `anchor`, facing `viewer`, never below the floor. */
export function defaultScreenPlacement(anchor: Vec3, viewer: Vec3, height: number): { position: Vec3; rotation: Vec3 } {
  return {
    position: [anchor[0], Math.max(anchor[1], height / 2), anchor[2]],
    rotation: [0, yawToward({ x: anchor[0], z: anchor[2] }, { x: viewer[0], z: viewer[2] }), 0],
  };
}