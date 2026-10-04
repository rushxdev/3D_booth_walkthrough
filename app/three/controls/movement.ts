import type { WalkInputState } from "./walkInput";

export const RUN_MULTIPLIER = 2;
export const MAX_DT = 0.05; // s: a long frame (tab switch) must not teleport the player
const SMOOTHING = 14; // 1/s: higher is snappier start and stop

export type Vec2 = { x: number; z: number };

/** Unit horizontal direction the player wants to move, in world space, for a camera yaw. */
export function wishVector(input: WalkInputState, yaw: number): Vec2 {
  const f = (input.forward ? 1 : 0) - (input.back ? 1 : 0);
  const r = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  // yaw 0 looks toward -Z, and positive yaw turns left
  let x = -Math.sin(yaw) * f + Math.cos(yaw) * r;
  let z = -Math.cos(yaw) * f - Math.sin(yaw) * r;
  const length = Math.hypot(x, z);
  if (length > 0) {
    x /= length; // diagonals are not faster
    z /= length;
  }
  return { x, z };
}

/** Eases `velocity` toward wish * speed. Frame-rate independent (exponential smoothing). */
export function stepVelocity(velocity: Vec2, wish: Vec2, speed: number, dt: number): void {
  const k = 1 - Math.exp(-SMOOTHING * dt);
  velocity.x += (wish.x * speed - velocity.x) * k;
  velocity.z += (wish.z * speed - velocity.z) * k;
}

/** Eases a value toward a target, frame-rate independent. Softens the camera pop on stairs. */
export function smoothTowards(current: number, target: number, rate: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}

/** Camera yaw that makes "forward" point along the horizontal direction (dx, dz). */
export function yawFromDirection(dx: number, dz: number): number {
  if (Math.hypot(dx, dz) < 1e-6) return 0;
  return Math.atan2(-dx, -dz);
}