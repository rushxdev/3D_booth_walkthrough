import * as THREE from "three";

function collectTextures(material: THREE.Material, into: Set<THREE.Texture>): void {
  for (const value of Object.values(material)) {
    if ((value as THREE.Texture | null)?.isTexture) into.add(value as THREE.Texture);
  }
  const uniforms = (material as THREE.ShaderMaterial).uniforms;
  if (uniforms) {
    for (const u of Object.values(uniforms)) {
      const v = (u as { value?: THREE.Texture } | null)?.value;
      if (v?.isTexture) into.add(v);
    }
  }
}

/** Frees the GPU resources of everything under root. Safe to call more than once. */
export function disposeObject(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    if (mesh.material) {
      for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(m);
    }
    if ((obj as THREE.SkinnedMesh).isSkinnedMesh) (obj as THREE.SkinnedMesh).skeleton?.dispose();
    if ((obj as THREE.InstancedMesh).isInstancedMesh) (obj as THREE.InstancedMesh).dispose();
  });

  for (const m of materials) collectTextures(m, textures);

  geometries.forEach((g) => g.dispose());
  textures.forEach((t) => t.dispose());
  materials.forEach((m) => m.dispose());
}