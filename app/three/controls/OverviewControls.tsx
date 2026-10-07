"use client";

import { useEffect, useRef } from "react";
import type { ComponentRef, RefObject } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useStore } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "./../../store/useSceneStore";
import { useUiStore } from "./../../store/useUiStore";
import { getModelKey } from "../collision/colliderCache";
import { measureModel } from "../loaders/normalize";
import { applyClipPlanes } from "./applyClipPlanes";
import { DEFAULT_BOUNDS, computeFraming, viewLimits } from "./framing";
import { canRestoreOrbit, orbitView, saveOrbitView } from "./orbitView";
import { takeOrbitResume } from "./../../presentation/cameraResume";

const FLOOR_CLEARANCE = 0.1; // meters; the camera never sinks below this

export function OverviewControls({ modelRef }: { modelRef: RefObject<THREE.Group | null> }) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const store = useStore();
  const modelKey = getModelKey(useSceneStore((s) => s.model));
  const frameTick = useUiStore((s) => s.frameTick);

  // Runs on mount (entering Overview), on a new model or unit, and on Frame requests.
  useEffect(() => {
    const controls = controlsRef.current;
    const { camera, scene, size } = store.getState();
    if (!controls || !(camera instanceof THREE.PerspectiveCamera)) return;

    const bounds = (modelRef.current && measureModel(modelRef.current)) ?? DEFAULT_BOUNDS;
    const framing = computeFraming(bounds.min, bounds.max, camera.fov, size.width / size.height);
    const limits = viewLimits(framing.radius);

    applyClipPlanes(camera, scene, limits);
    controls.minDistance = limits.minDistance;
    controls.maxDistance = limits.maxDistance;

    if (canRestoreOrbit(orbitView, modelKey, frameTick)) {
      camera.position.copy(orbitView.position); // coming back from Walk: same view as before
      controls.target.copy(orbitView.target);
    } else {
      camera.position.set(...framing.position);
      controls.target.set(...framing.target);
    }
    controls.update();
  }, [modelKey, frameTick, store, modelRef]);

  // Apply camera pose snapshot if exiting presentation mode
  useFrame(({ camera }) => {
    const pose = takeOrbitResume();
    const controls = controlsRef.current;
    if (!pose || !controls) return;
    camera.position.set(...pose.position);
    controls.target.set(...pose.target);
    controls.update();
  });

  // Runs after OrbitControls' own update (priority -1).
  useFrame(({ camera }) => {
    if (camera.position.y < FLOOR_CLEARANCE) camera.position.y = FLOOR_CLEARANCE;
    const controls = controlsRef.current;
    if (controls) saveOrbitView(camera.position, controls.target, modelKey, frameTick);
  });

  return <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.12} zoomToCursor screenSpacePanning />;
}