"use client";

import { useEffect, useRef } from "react";
import type { ComponentRef, RefObject } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useStore } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "./../../store/useSceneStore";
import { useUiStore } from "./../../store/useUiStore";
import { measureModel } from "../loaders/normalize";
import { DEFAULT_BOUNDS, computeFraming, viewLimits } from "./framing";

const FLOOR_CLEARANCE = 0.1; // meters; the camera never sinks below this

type Props = { modelRef: RefObject<THREE.Group | null> };

export function OverviewControls({ modelRef }: Props) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const store = useStore();

  // Triggers: a new model (or unit change, which replaces the model object) and Frame requests.
  const model = useSceneStore((s) => s.model);
  const frameTick = useUiStore((s) => s.frameTick);

  useEffect(() => {
    const controls = controlsRef.current;
    const { camera, scene, size } = store.getState();
    if (!controls || !(camera instanceof THREE.PerspectiveCamera)) return;

    const bounds = (modelRef.current && measureModel(modelRef.current)) ?? DEFAULT_BOUNDS;
    const framing = computeFraming(bounds.min, bounds.max, camera.fov, size.width / size.height);
    const limits = viewLimits(framing.radius);

    camera.near = limits.near;
    camera.far = limits.far;
    camera.updateProjectionMatrix();
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = limits.far * 0.3;
      scene.fog.far = limits.far * 0.9;
    }

    controls.minDistance = limits.minDistance;
    controls.maxDistance = limits.maxDistance;
    camera.position.set(...framing.position);
    controls.target.set(...framing.target);
    controls.update();
  }, [model, frameTick, store, modelRef]);

  // Runs after OrbitControls' own update (priority -1), so it wins.
  useFrame(({ camera }) => {
    if (camera.position.y < FLOOR_CLEARANCE) camera.position.y = FLOOR_CLEARANCE;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.12}
      zoomToCursor
      screenSpacePanning
    />
  );
}