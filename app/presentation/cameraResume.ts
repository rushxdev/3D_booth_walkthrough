import * as THREE from "three";
import type { Vec3 } from "./../lib/schema";
import { cameraPose } from "./../three/controls/cameraPose";
import { orbitView, saveOrbitView } from "./../three/controls/orbitView";
import { player } from "./../three/controls/player";

export type ViewMode = "overview" | "walk";

export type OrbitPose = { position: Vec3; target: Vec3 };
/** feet: player position. heading: horizontal look direction (x, z), unit length. */
export type WalkPose = { feet: Vec3; heading: [number, number] };

export type CameraSnapshot = {
  /** modelIdentity key: a snapshot is only valid for the model it was taken on. */
  identityKey: string;
  orbit: OrbitPose | null;
  walk: WalkPose | null;
};

const toVec3 = (v: THREE.Vector3): Vec3 => [v.x, v.y, v.z];
const isFiniteVec = (v: THREE.Vector3) => Number.isFinite(v.x + v.y + v.z);

/** Horizontal part of a look direction. Straight up or down has none, so face -Z. */
export function headingOf(direction: THREE.Vector3): [number, number] {
  const len = Math.hypot(direction.x, direction.z);
  return len < 1e-6 ? [0, -1] : [direction.x / len, direction.z / len];
}

/** Copies the live camera state. Never aliases the singletons. */
export function captureCamera(mode: ViewMode, identityKey: string): CameraSnapshot {
  const orbit =
    orbitView.valid && isFiniteVec(orbitView.position) && isFiniteVec(orbitView.target)
      ? { position: toVec3(orbitView.position), target: toVec3(orbitView.target) }
      : null;

  const walk =
    mode === "walk" && isFiniteVec(player.position)
      ? { feet: toVec3(player.position), heading: headingOf(cameraPose.direction) }
      : null;

  return { identityKey, orbit, walk };
}

/* Poses waiting for a controller to apply them. Each is handed out once. */
let pendingOrbit: OrbitPose | null = null;
let pendingWalk: WalkPose | null = null;

export function clearCameraResume(): void {
  pendingOrbit = null;
  pendingWalk = null;
}

export const takeOrbitResume = (): OrbitPose | null => {
  const p = pendingOrbit;
  pendingOrbit = null;
  return p;
};

export const takeWalkResume = (): WalkPose | null => {
  const p = pendingWalk;
  pendingWalk = null;
  return p;
};

/**
 * Puts the entry camera back. Call it BEFORE the mode is switched back, so a controller that
 * remounts reads the restored orbitView. Skips silently when the model is not the same.
 */
export function restoreCamera(
  snapshot: CameraSnapshot | null,
  ctx: { identityKey: string; frameTick: number; finalMode: ViewMode },
): void {
  clearCameraResume();
  if (!snapshot || snapshot.identityKey !== ctx.identityKey) return;

  if (snapshot.orbit) {
    // Current frameTick: otherwise a Frame press during the presentation would discard it.
    saveOrbitView(
      new THREE.Vector3(...snapshot.orbit.position),
      new THREE.Vector3(...snapshot.orbit.target),
      orbitView.modelKey,
      ctx.frameTick,
    );
    if (ctx.finalMode === "overview") pendingOrbit = snapshot.orbit;
  }
  if (snapshot.walk && ctx.finalMode === "walk") pendingWalk = snapshot.walk;
}