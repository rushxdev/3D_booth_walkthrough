"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Lighting } from "./Lighting";
import { Floor } from "./Floor";
import { SampleBooth } from "./SampleBooth";
import { useSceneStore } from "./../../store/useSceneStore";
import { useUiStore } from "./../../store/useUiStore";
import { OverviewControls } from "../controls/OverviewControls";
import { registerLoaderRenderer } from "../loaders/gltfLoader";
import { FileModel } from "./FileModel";

// Keep in sync with --surface-0 in globals.css (WebGL can't read CSS variables).
const BACKGROUND = "#131416";

export default function SceneCanvas() {

  const model = useSceneStore((s) => s.model);
  const mode = useUiStore((s) => s.mode);
  const modelRef = useRef<THREE.Group>(null);
  
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
      onCreated={({ gl }) => registerLoaderRenderer(gl)}
    >
      <color attach="background" args={[BACKGROUND]} />
      {/* distant ground fades into the background: no hard horizon line */}
      <fog attach="fog" args={[BACKGROUND, 80, 220]} />

      <Lighting />
      <Floor />
      <group ref={modelRef}>
        {model?.kind === "sample" && <SampleBooth />}
        {model?.kind === "file" && (
          <FileModel key={model.scene.uuid} scene={model.scene} measure={model.measure} unit={model.unit} />
        )}
      </group>

      {mode === "overview" && <OverviewControls modelRef={modelRef} />}

    </Canvas>
  );
}