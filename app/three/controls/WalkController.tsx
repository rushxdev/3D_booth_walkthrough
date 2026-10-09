"use client";

import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import { useStore } from "@react-three/fiber";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { useSceneStore } from "./../../store/useSceneStore";
import { useUiStore } from "./../../store/useUiStore";
import type { Collider } from "../collision/buildCollider";
import { stepMover } from "../collision/capsuleMover";
import { getCollider, getModelKey } from "../collision/colliderCache";
import { EYE_HEIGHT } from "../collision/constants";
import { findSpawn } from "../collision/spawn";
import { applyClipPlanes } from "./applyClipPlanes";
import { viewLimits } from "./framing";
import { MAX_DT, RUN_MULTIPLIER, smoothTowards, stepVelocity, wishVector, yawFromDirection } from "./movement";
import { orbitView } from "./orbitView";
import { placePlayer, player } from "./player";
import { registerPointerLocker } from "./walkLock";
import { walkInput } from "./walkInput";
import { takeWalkResume } from "./../../presentation/cameraResume";
import { useGuardedFrame } from "./useGuardedFrame";

const euler = new THREE.Euler(0, 0, 0, "YXZ");

export function WalkController({ modelRef }: { modelRef: RefObject<THREE.Group | null> }) {
  const store = useStore();
  const model = useSceneStore((s) => s.model);
  const resetTick = useUiStore((s) => s.resetTick);
  const colliderRef = useRef<Collider | null>(null);
  const eyeY = useRef(0);
  const handledReset = useRef(resetTick);

  // Mouse look (pointer lock), keyboard and sensitivity, while walk mode is mounted.
  useEffect(() => {
    const { camera, gl } = store.getState();
    const controls = new PointerLockControls(camera, gl.domElement);
    controls.minPolarAngle = 0.05; // stop short of straight up/down so the view can't flip
    controls.maxPolarAngle = Math.PI - 0.05;
    controls.pointerSpeed = useUiStore.getState().lookSensitivity;
    const unsubscribe = useUiStore.subscribe((s) => {
      controls.pointerSpeed = s.lookSensitivity;
    });

    const onLock = () => useUiStore.getState().setWalkLocked(true);
    const onUnlock = () => {
      useUiStore.getState().setWalkLocked(false);
      walkInput.reset();
    };
    controls.addEventListener("lock", onLock);
    controls.addEventListener("unlock", onUnlock);
    registerPointerLocker(() => controls.lock());
    const detachKeys = walkInput.attach(window, () => useUiStore.getState().walkLocked);

    return () => {
      unsubscribe();
      detachKeys();
      registerPointerLocker(null);
      controls.removeEventListener("lock", onLock);
      controls.removeEventListener("unlock", onUnlock);
      if (controls.isLocked) controls.unlock();
      controls.dispose();
      useUiStore.getState().setWalkLocked(false);
    };
  }, [store]);

  const spawn = useCallback(
    (fromOrbitView: boolean) => {
      const { camera, scene } = store.getState();
      if (!(camera instanceof THREE.PerspectiveCamera)) return;

      const key = getModelKey(model);
      const root = modelRef.current;
      root?.updateMatrixWorld(true); // a model swapped during Walk has not rendered yet
      const collider = root ? getCollider(root, key) : null;
      colliderRef.current = collider;

      // Entering from Overview: stand where the orbit view was focused, facing the same way.
      let near: { x: number; z: number } | undefined;
      let yaw = 0;
      if (fromOrbitView && orbitView.valid && orbitView.modelKey === key) {
        near = { x: orbitView.target.x, z: orbitView.target.z };
        yaw = yawFromDirection(orbitView.target.x - orbitView.position.x, orbitView.target.z - orbitView.position.z);
      }

      placePlayer(findSpawn(collider, near));
      camera.rotation.set(0, yaw, 0, "YXZ");
      eyeY.current = player.position.y + EYE_HEIGHT;
      camera.position.set(player.position.x, eyeY.current, player.position.z);

      const radius = collider ? Math.max(0.5, 0.5 * collider.bounds.getSize(new THREE.Vector3()).length()) : 5;
      applyClipPlanes(camera, scene, { near: 0.05, far: viewLimits(radius).far });
    },
    [store, modelRef, model],
  );

  // Entering Walk, or the model/unit changed (then the saved orbit view no longer matches: default spawn).
  useEffect(() => {
    spawn(true);
  }, [spawn]);

  // Reset position (button or R): always the default spawn.
  useEffect(() => {
    if (handledReset.current === resetTick) return;
    handledReset.current = resetTick;
    spawn(false);
  }, [resetTick, spawn]);

  useGuardedFrame("walk", (state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const { camera } = state;
    const ui = useUiStore.getState();

    const resume = takeWalkResume();
    if (resume) {
      placePlayer(resume.feet);
      eyeY.current = resume.feet[1] + EYE_HEIGHT;
      camera.position.set(resume.feet[0], eyeY.current, resume.feet[2]);
      camera.lookAt(camera.position.x + resume.heading[0], camera.position.y, camera.position.z + resume.heading[1]);
    }

    if (ui.walkLocked) {
      euler.setFromQuaternion(camera.quaternion, "YXZ");
      const speed = ui.walkSpeed * (walkInput.state.run ? RUN_MULTIPLIER : 1);
      stepVelocity(player.velocity, wishVector(walkInput.state, euler.y), speed, dt);
    } else {
      player.velocity.x = 0; // keep settling onto the ground, but don't walk
      player.velocity.z = 0;
    }

    stepMover(colliderRef.current, player, dt);

    eyeY.current = smoothTowards(eyeY.current, player.position.y + EYE_HEIGHT, 18, dt);
    camera.position.set(player.position.x, eyeY.current, player.position.z);
  });

  return null;
}