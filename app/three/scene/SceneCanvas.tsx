"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Lighting } from "./Lighting";
import { Floor } from "./Floor";

// Keep in sync with --surface-0 in globals.css (WebGL can't read CSS variables).
const BACKGROUND = "#131416";

export default function SceneCanvas() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [6, 4, 8], fov: 50, near: 0.1, far: 500 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <color attach="background" args={[BACKGROUND]} />
      {/* distant ground fades into the background: no hard horizon line */}
      <fog attach="fog" args={[BACKGROUND, 80, 220]} />

      <Lighting />
      <Floor />

      {/* temporary lighting test objects, removed in 2.5 */}
      <mesh position={[-1.2, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#cfd2d6" roughness={0.6} />
      </mesh>
      <mesh position={[1.2, 0.5, 0]}>
        <sphereGeometry args={[0.5, 48, 32]} />
        <meshStandardMaterial color="#cfd2d6" roughness={0.25} metalness={0.9} />
      </mesh>
    </Canvas>
  );
}