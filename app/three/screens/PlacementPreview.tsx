"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { useStore } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "./../../store/useSceneStore";
import { useScreenStore } from "./../../store/useScreenStore";
import { useUiStore } from "./../../store/useUiStore";
import { getCollider, getModelKey } from "../collision/colliderCache";
import { cameraPose } from "../controls/cameraPose";
import { pointerToNdc } from "./picking";
import { ACCENT_COLOR } from "../scene/theme";
import { poseOnSurface } from "./surfacePlacement";
import type { Pose } from "./surfacePlacement";
import { usePresenting } from "@/app/presentation/usePresenting";
import { useGuardedFrame } from "./../controls/useGuardedFrame";

const OUTLINE_POINTS = new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]);

/** Shows where the selected screen would land under the pointer. Reads and writes no React state. */
export function PlacementPreview({ modelRef }: { modelRef: RefObject<THREE.Group | null> }) {
  const presenting = usePresenting();
  const store = useStore();
  const placing = useUiStore((s) => s.placing);
  const group = useRef<THREE.Group>(null);
  const pose = useRef<Pose | null>(null);

  useEffect(() => {
    if (!placing || presenting) return;
    const g = group.current;
    const element = store.getState().gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let last: PointerEvent | null = null;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!last) return;
      const { camera } = store.getState();
      pointerToNdc(last.clientX, last.clientY, element.getBoundingClientRect(), ndc);
      raycaster.setFromCamera(ndc, camera);
      const collider = modelRef.current ? getCollider(modelRef.current, getModelKey(useSceneStore.getState().model)) : null;
      pose.current = poseOnSurface(raycaster.ray, collider, [cameraPose.direction.x, cameraPose.direction.y, cameraPose.direction.z]);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(update); // at most one raycast per frame
    };

    element.style.cursor = "crosshair";
    element.addEventListener("pointermove", onMove);
    return () => {
      element.style.cursor = "";
      element.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      pose.current = null;
      if (g) g.visible = false;
    };
  }, [placing, presenting, store, modelRef]);

  useGuardedFrame("placement-preview", () => {
    const g = group.current;
    if (!g) return;
    const screens = useScreenStore.getState();
    const selected = screens.screens.find((s) => s.id === screens.selectedId);
    const p = pose.current;
    if (!placing || !p || !selected) {
      g.visible = false;
      return;
    }
    g.visible = true;
    g.position.set(...p.position);
    g.rotation.set(...p.rotation);
    g.scale.set(selected.width, selected.height, 1);
  });

  if (presenting) return null;

  return (
    <group ref={group} visible={false} rotation-order="YXZ">
      <lineLoop raycast={() => {}}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[OUTLINE_POINTS, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={ACCENT_COLOR} toneMapped={false} />
      </lineLoop>
    </group>
  );
}