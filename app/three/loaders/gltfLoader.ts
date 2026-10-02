import type { WebGLRenderer } from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";

let renderer: WebGLRenderer | null = null;
let loader: GLTFLoader | null = null;

/** KTX2 needs the renderer to detect which compressed texture formats the GPU supports. */
export function registerLoaderRenderer(gl: WebGLRenderer): void {
  renderer = gl;
  loader = null; // rebuild with the new renderer on next use
}

export function getGltfLoader(): GLTFLoader {
  if (loader) return loader;
  const l = new GLTFLoader();
  l.setDRACOLoader(new DRACOLoader().setDecoderPath("/draco/"));
  l.setMeshoptDecoder(MeshoptDecoder);
  if (renderer) {
    l.setKTX2Loader(new KTX2Loader().setTranscoderPath("/basis/").detectSupport(renderer));
  }
  loader = l;
  return l;
}