"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import { useStore } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "./../../store/useSceneStore";
import { useScreenStore } from "./../../store/useScreenStore";
import { useUiStore } from "./../../store/useUiStore";
import { getCollider, getModelKey } from "../collision/colliderCache";
import { cameraPose } from "../controls/cameraPose";
import { gizmo } from "./gizmoState";
import { isClick, pointerToNdc, resolvePick } from "./picking";
import type { ScreenHit } from "./picking";
import { poseOnSurface } from "./surfacePlacement";

type Props = {
  screensRef: RefObject<THREE.Group | null>;
  modelRef: RefObject<THREE.Group | null>;
};

/** Overview clicks: place a screen (Place tool active), select a screen, or deselect. */
export function ScreenPicker({ screensRef, modelRef }: Props) {
  const store = useStore();

  useEffect(() => {
    const element = store.getState().gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let down: { x: number; y: number } | null = null;

    const aim = (e: PointerEvent) => {
      const { camera } = store.getState();
      pointerToNdc(e.clientX, e.clientY, element.getBoundingClientRect(), ndc);
      raycaster.setFromCamera(ndc, camera);
    };
    // built on first use, then cached; only needed when a wall might be in the way or for placing
    const modelCollider = () =>
      modelRef.current ? getCollider(modelRef.current, getModelKey(useSceneStore.getState().model)) : null;

    function place() {
      const screens = useScreenStore.getState();
      const ui = useUiStore.getState();
      const selected = screens.screens.find((s) => s.id === screens.selectedId);
      if (!selected || selected.locked) {
        ui.setPlacing(false);
        return;
      }
      const forward: [number, number, number] = [cameraPose.direction.x, cameraPose.direction.y, cameraPose.direction.z];
      const pose = poseOnSurface(raycaster.ray, modelCollider(), forward);
      if (!pose) return; // clicked the sky: stay in the tool
      screens.update(selected.id, pose);
      ui.setPlacing(false);
    }

    function pick() {
      const screens = useScreenStore.getState();
      const hits = screensRef.current ? raycaster.intersectObjects(screensRef.current.children, true) : [];
      const hit = hits.find((h) => typeof h.object.userData.screenId === "string");

      let screenHit: ScreenHit | null = null;
      if (hit) {
        const id = hit.object.userData.screenId as string;
        const screen = screens.screens.find((s) => s.id === id);
        if (screen) screenHit = { id, distance: hit.distance, locked: screen.locked };
      }

      let modelDistance: number | null = null;
      if (screenHit) modelDistance = modelCollider()?.bvh.raycastFirst(raycaster.ray, THREE.DoubleSide)?.distance ?? null;

      const result = resolvePick(screenHit, modelDistance);
      if (result.kind === "select") screens.select(result.id);
      else if (result.kind === "none") screens.select(null);
      // "blocked": a locked screen swallows the click and nothing changes
    }

    const onDown = (e: PointerEvent) => {
      // A press on a gizmo handle belongs to the gizmo, not to selection.
      down = e.button === 0 && !gizmo.controls?.axis ? { x: e.clientX, y: e.clientY } : null;
    };
    const onUp = (e: PointerEvent) => {
      const start = down;
      down = null;
      if (!start || e.button !== 0) return;
      if (!isClick(start, { x: e.clientX, y: e.clientY })) return; // an orbit drag
      const ui = useUiStore.getState();
      if (ui.mode !== "overview") return;

      aim(e);
      if (ui.placing) place();
      else pick();
    };

    element.addEventListener("pointerdown", onDown);
    element.addEventListener("pointerup", onUp);
    return () => {
      element.removeEventListener("pointerdown", onDown);
      element.removeEventListener("pointerup", onUp);
    };
  }, [store, screensRef, modelRef]);

  return null;
}