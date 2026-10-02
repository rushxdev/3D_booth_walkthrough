"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Lighting } from "./Lighting";
import { Floor } from "./Floor";
import { SampleBooth } from "./SampleBooth";
import { useSceneStore } from "./../../store/useSceneStore";

// Keep in sync with --surface-0 in globals.css (WebGL can't read CSS variables).
const BACKGROUND = "#131416";

export default function SceneCanvas() {

  const model = useSceneStore((s) => s.model);
  
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [8, 6, 10], fov: 50, near: 0.1, far: 500 }}
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
      
      {model?.kind === "sample" && <SampleBooth />}

    </Canvas>
  );
}