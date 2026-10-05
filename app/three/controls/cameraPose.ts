import * as THREE from "three";

/** The live camera, written every frame and read by UI actions such as Add screen. */
export const cameraPose = {
  position: new THREE.Vector3(0, 6, 10),
  direction: new THREE.Vector3(0, 0, -1), // unit vector the camera looks along
};