"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

// Keep in sync with --surface-0 in globals.css (WebGL can't read CSS variables).
const BACKGROUND = "#131416";

export default function SceneCanvas() {
  return (
    <Canvas
      dpr={[1, 2]} // device pixel ratio, clamped to 1..2
      camera={{ position: [6, 4, 8], fov: 50, near: 0.1, far: 500 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <color attach="background" args={[BACKGROUND]} />
      {/* temporary placeholder, replaced by lighting + floor + sample in 2.3 to 2.5 */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshNormalMaterial />
      </mesh>
    </Canvas>
  );
}