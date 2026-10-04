"use client";

import { useEffect } from "react";
import type { RefObject } from "react";
import { useStore } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "./../../store/useSceneStore";
import { useScreenStore } from "./../../store/useScreenStore";
import { useUiStore } from "./../../store/useUiStore";
import { getCollider, getModelKey } from "../collision/colliderCache";
import { isClick, resolvePick } from "./picking";
import type { ScreenHit } from "./picking";

type Props = {
  screensRef: RefObject<THREE.Group | null>;
  modelRef: RefObject<THREE.Group | null>;
};

/** Click a screen to select it, click anything else to deselect. Overview mode only. */
export function ScreenPicker({ screensRef, modelRef }: Props) {
  const store = useStore();

  useEffect(() => {
    const element = store.getState().gl.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let down: { x: number; y: number } | null = null;

    function pick(e: PointerEvent) {
      const { camera } = store.getState();
      const rect = element.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);

      const screens = useScreenStore.getState();
      const hits = screensRef.current ? raycaster.intersectObjects(screensRef.current.children, true) : [];
      const hit = hits.find((h) => typeof h.object.userData.screenId === "string");

      let screenHit: ScreenHit | null = null;
      if (hit) {
        const id = hit.object.userData.screenId as string;
        const screen = screens.screens.find((s) => s.id === id);
        if (screen) screenHit = { id, distance: hit.distance, locked: screen.locked };
      }

      // Only now is the model's BVH needed (built once, then cached): is a wall in front?
      let modelDistance: number | null = null;
      if (screenHit && modelRef.current) {
        const collider = getCollider(modelRef.current, getModelKey(useSceneStore.getState().model));
        modelDistance = collider?.bvh.raycastFirst(raycaster.ray, THREE.DoubleSide)?.distance ?? null;
      }

      const result = resolvePick(screenHit, modelDistance);
      if (result.kind === "select") screens.select(result.id);
      else if (result.kind === "none") screens.select(null);
      // "blocked": a locked screen swallows the click and nothing changes
    }

    const onDown = (e: PointerEvent) => {
      down = e.button === 0 ? { x: e.clientX, y: e.clientY } : null;
    };
    const onUp = (e: PointerEvent) => {
      const start = down;
      down = null;
      if (!start || e.button !== 0) return;
      if (!isClick(start, { x: e.clientX, y: e.clientY })) return; // an orbit drag
      if (useUiStore.getState().mode !== "overview") return;
      pick(e);
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