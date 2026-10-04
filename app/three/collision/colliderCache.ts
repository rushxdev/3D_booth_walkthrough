import type * as THREE from "three";
import type { ModelSource } from "./../../store/useSceneStore";
import { buildCollider } from "./buildCollider";
import type { Collider } from "./buildCollider";

/** Changes whenever the world-space geometry changes: new model, or a new unit (which rescales it). */
export function getModelKey(model: ModelSource | null): string {
  if (!model) return "none";
  return model.kind === "sample" ? "sample" : `${model.scene.uuid}:${model.unit}`;
}

let cached: { key: string; collider: Collider | null } | null = null;

/**
 * Builds the collider on first use for a key and reuses it afterwards.
 * `root`'s transforms must already reflect that key (placement applied).
 */
export function getCollider(root: THREE.Object3D, key: string): Collider | null {
  if (cached?.key !== key) {
    const started = performance.now();
    cached = { key, collider: buildCollider(root) };
    if (process.env.NODE_ENV !== "production" && cached.collider) {
      const ms = Math.round(performance.now() - started);
      console.info(`[collider] ${cached.collider.triangleCount} triangles in ${ms} ms`);
    }
  }
  return cached.collider;
}

export function clearColliderCache(): void {
  cached = null;
}