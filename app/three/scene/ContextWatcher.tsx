import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useGraphicsStore } from "@/app/store/useGraphicsStore";
import { registerLoaderRenderer } from "../loaders/gltfLoader";
import { watchContext } from "./contextWatch";

/**
 * Reports WebGL context loss and re-registers the KTX2 renderer when it returns.
 * three.js itself re-initializes the renderer and re-uploads textures.
 */
export function ContextWatcher() {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const { markLost, markRestored, markStuck, reset } = useGraphicsStore.getState();
    reset();
    return watchContext(gl.domElement, {
      onLost: markLost,
      onRestored: () => {
        registerLoaderRenderer(gl);
        markRestored();
      },
      onTimeout: markStuck,
    });
  }, [gl]);

  return null;
}