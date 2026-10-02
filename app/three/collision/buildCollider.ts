import * as THREE from "three";
import { MeshBVH } from "three-mesh-bvh";

export type Collider = {
  bvh: MeshBVH;
  triangleCount: number;
  bounds: THREE.Box3;
  skippedMeshes: number; // skinned or instanced meshes, which are not supported
};

/**
 * Builds one BVH over every visible static mesh under `root`, in world space.
 * Screens and helpers are kept out by living outside `root`, or by userData.noCollide.
 * Cost is O(triangles) and runs synchronously: expect ~1 s per million triangles.
 * Returns null when there is nothing solid to collide with.
 */
export function buildCollider(root: THREE.Object3D): Collider | null {
  root.updateMatrixWorld(true);

  const meshes: THREE.Mesh[] = [];
  let skippedMeshes = 0;

  root.traverseVisible((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || mesh.userData.noCollide === true) return;
    if ((mesh as THREE.SkinnedMesh).isSkinnedMesh || (mesh as THREE.InstancedMesh).isInstancedMesh) {
      skippedMeshes += 1;
      return;
    }
    const position = mesh.geometry?.getAttribute("position");
    if (!position || position.count < 3) return;
    meshes.push(mesh);
  });
  if (meshes.length === 0) return null;

  let vertexTotal = 0;
  let indexTotal = 0;
  for (const mesh of meshes) {
    const g = mesh.geometry;
    const vertices = g.getAttribute("position").count;
    const entries = g.index ? g.index.count : vertices;
    vertexTotal += vertices;
    indexTotal += entries - (entries % 3);
  }

  const positions = new Float32Array(vertexTotal * 3);
  const indices = new Uint32Array(indexTotal);
  const v = new THREE.Vector3();
  let vertexOffset = 0;
  let indexOffset = 0;

  for (const mesh of meshes) {
    const g = mesh.geometry;
    const position = g.getAttribute("position");

    for (let i = 0; i < position.count; i++) {
      v.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
      const o = (vertexOffset + i) * 3;
      positions[o] = v.x;
      positions[o + 1] = v.y;
      positions[o + 2] = v.z;
    }

    const entries = g.index ? g.index.count : position.count;
    const usable = entries - (entries % 3);
    for (let i = 0; i < usable; i++) {
      indices[indexOffset + i] = vertexOffset + (g.index ? g.index.getX(i) : i);
    }

    vertexOffset += position.count;
    indexOffset += usable;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeBoundingBox();

  const box = geometry.boundingBox;
  if (!box || ![box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z].every(Number.isFinite)) {
    return null; // NaN vertices would break the BVH build
  }

  const bvh = new MeshBVH(geometry);
  return { bvh, triangleCount: indices.length / 3, bounds: box.clone(), skippedMeshes };
}