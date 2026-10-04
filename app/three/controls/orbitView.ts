import * as THREE from "three";

/** The last Overview camera, kept outside React so Walk can start from it and Overview can return to it. */
export const orbitView = {
  position: new THREE.Vector3(),
  target: new THREE.Vector3(),
  valid: false,
  modelKey: "",
  frameTick: -1,
};

export function saveOrbitView(position: THREE.Vector3, target: THREE.Vector3, modelKey: string, frameTick: number): void {
  orbitView.position.copy(position);
  orbitView.target.copy(target);
  orbitView.modelKey = modelKey;
  orbitView.frameTick = frameTick;
  orbitView.valid = true;
}

/** Restore only for the same model (and unit), and when no new Frame was requested. */
export function canRestoreOrbit(
  view: { valid: boolean; modelKey: string; frameTick: number },
  modelKey: string,
  frameTick: number,
): boolean {
  return view.valid && view.modelKey === modelKey && view.frameTick === frameTick;
}