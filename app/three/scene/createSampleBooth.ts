import * as THREE from "three";

export const SAMPLE_BOOTH_NAME = "Sample booth";

// All values in meters.
const FLOOR_T = 0.05;
const WALL_H = 3.0;
const WALL_T = 0.1;
const HALF_W = 3.0; // wall centerline x
const HALF_D = 2.5; // wall centerline z
const DOOR_W = 1.2;
const DOOR_H = 2.1; // clear height above the floor
const RISE = 0.15;
const TREAD = 0.3;

type Vec3 = [number, number, number];

export function createSampleBooth(): THREE.Group {
  const root = new THREE.Group();
  root.name = SAMPLE_BOOTH_NAME;

  const wallMat = new THREE.MeshStandardMaterial({ color: "#d9dbde", roughness: 0.9 });
  const floorMat = new THREE.MeshStandardMaterial({ color: "#7d838b", roughness: 0.95 });
  const stepMat = new THREE.MeshStandardMaterial({ color: "#aeb3ba", roughness: 0.85 });
  const counterMat = new THREE.MeshStandardMaterial({ color: "#4a5058", roughness: 0.7 });
  const topMat = new THREE.MeshStandardMaterial({ color: "#e6e8ea", roughness: 0.4 });

  /** Axis-aligned box. `at` is [centerX, baseY, centerZ]. */
  function block(name: string, mat: THREE.Material, [w, h, d]: Vec3, [x, baseY, z]: Vec3) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.name = name;
    mesh.position.set(x, baseY + h / 2, z);
    root.add(mesh);
  }

  // Floor slab
  block("Floor", floorMat, [2 * HALF_W + WALL_T, FLOOR_T, 2 * HALF_D + WALL_T], [0, 0, 0]);

  // Walls: back and front span the corners, side walls fit between them
  const fullW = 2 * HALF_W + WALL_T;
  const sideLen = 2 * HALF_D - WALL_T;
  block("Wall back", wallMat, [fullW, WALL_H, WALL_T], [0, 0, -HALF_D]);
  block("Wall left", wallMat, [WALL_T, WALL_H, sideLen], [-HALF_W, 0, 0]);
  block("Wall right", wallMat, [WALL_T, WALL_H, sideLen], [HALF_W, 0, 0]);

  // Front wall with a doorway: two side segments plus a lintel
  const segW = (fullW - DOOR_W) / 2;
  const segX = DOOR_W / 2 + segW / 2;
  block("Wall front left", wallMat, [segW, WALL_H, WALL_T], [-segX, 0, HALF_D]);
  block("Wall front right", wallMat, [segW, WALL_H, WALL_T], [segX, 0, HALF_D]);
  const lintelBase = FLOOR_T + DOOR_H;
  block("Door lintel", wallMat, [DOOR_W, WALL_H - lintelBase, WALL_T], [0, lintelBase, HALF_D]);

  // Raised platform against the back wall (inner face at z = -2.45)
  const platformTop = FLOOR_T + 4 * RISE;
  const platformDepth = 1.6;
  const innerBack = -HALF_D + WALL_T / 2;
  block("Platform", stepMat, [3.0, platformTop, platformDepth], [0, 0, innerBack + platformDepth / 2]);

  // Stairs: solid boxes so there are no gaps underneath. Step 3 touches the platform.
  const stairFront = innerBack + platformDepth; // z where the platform's front edge sits
  for (let i = 1; i <= 3; i++) {
    const zCenter = stairFront + TREAD / 2 + (3 - i) * TREAD;
    block(`Step ${i}`, stepMat, [1.5, FLOOR_T + RISE * i, TREAD], [0, 0, zCenter]);
  }

  // Counter flush with the left wall, clear of the doorway
  const counterH = FLOOR_T + 1.0;
  block("Counter", counterMat, [1.8, counterH, 0.6], [-(HALF_W - WALL_T / 2) + 0.9, 0, 0.9]);
  block("Counter top", topMat, [1.8, 0.04, 0.7], [-(HALF_W - WALL_T / 2) + 0.9, counterH, 0.95]);

  return root;
}