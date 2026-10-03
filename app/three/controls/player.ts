import * as THREE from "three";
import type { Vec3 } from "../loaders/normalize";

/** Position is the player's FEET. Lives outside React: it changes every frame. */
export const player = {
  position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  grounded: false,
};

export function placePlayer(feet: Vec3): void {
  player.position.set(...feet);
  player.velocity.set(0, 0, 0);
  player.grounded = false;
}