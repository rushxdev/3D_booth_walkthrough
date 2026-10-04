import * as THREE from "three";

export function applyClipPlanes(
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  planes: { near: number; far: number },
): void {
  camera.near = planes.near;
  camera.far = planes.far;
  camera.updateProjectionMatrix();
  if (scene.fog instanceof THREE.Fog) {
    scene.fog.near = planes.far * 0.3;
    scene.fog.far = planes.far * 0.9;
  }
}