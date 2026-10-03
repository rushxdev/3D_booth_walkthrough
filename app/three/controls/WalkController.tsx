"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { useFrame, useStore } from "@react-three/fiber";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { useSceneStore } from "./../../store/useSceneStore";
import { useUiStore } from "./../../store/useUiStore";
import { getCollider, getModelKey } from "../collision/colliderCache";
import { EYE_HEIGHT } from "../collision/constants";
import { findSpawn } from "../collision/spawn";
import { applyClipPlanes } from "./applyClipPlanes";
import { viewLimits } from "./framing";
import { MAX_DT, RUN_SPEED, WALK_SPEED, smoothTowards, stepVelocity, wishVector } from "./movement";
import { placePlayer, player } from "./player";
import { registerPointerLocker } from "./walkLock";
import { walkInput } from "./walkInput";
import { Collider } from "../collision/buildCollider";
import { stepMover } from "../collision/capsuleMover";

const euler = new THREE.Euler(0, 0, 0, "YXZ");

export function WalkController({ modelRef }: { modelRef: RefObject<THREE.Group | null> }) {
  const store = useStore();
  const model = useSceneStore((s) => s.model);
  const colliderRef = useRef<Collider | null>(null);
  const eyeY = useRef(0);

  // Mouse look (pointer lock) and keyboard, for as long as walk mode is mounted.
  useEffect(() => {
    const { camera, gl } = store.getState();
    const controls = new PointerLockControls(camera, gl.domElement);
    controls.minPolarAngle = 0.05; // stop short of straight up/down so the view can't flip
    controls.maxPolarAngle = Math.PI - 0.05;

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
      detachKeys();
      registerPointerLocker(null);
      controls.removeEventListener("lock", onLock);
      controls.removeEventListener("unlock", onUnlock);
      if (controls.isLocked) controls.unlock();
      controls.dispose();
      useUiStore.getState().setWalkLocked(false);
    };
  }, [store]);

  // Spawn on entering walk mode and whenever the model (or its unit) changes.
  useEffect(() => {
    const { camera, scene } = store.getState();
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const root = modelRef.current;
    const collider = root ? getCollider(root, getModelKey(model)) : null;

    placePlayer(findSpawn(collider));
    colliderRef.current = collider;
    eyeY.current = player.position.y + EYE_HEIGHT;
    camera.rotation.set(0, 0, 0, "YXZ"); // look along -Z, level
    camera.position.set(player.position.x, player.position.y + EYE_HEIGHT, player.position.z);

    const radius = collider ? Math.max(0.5, 0.5 * collider.bounds.getSize(new THREE.Vector3()).length()) : 5;
    applyClipPlanes(camera, scene, { near: 0.05, far: viewLimits(radius).far });
  }, [model, store, modelRef]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const { camera } = state;

    if (useUiStore.getState().walkLocked) {
      euler.setFromQuaternion(camera.quaternion, "YXZ");
      const speed = walkInput.state.run ? RUN_SPEED : WALK_SPEED;
      stepVelocity(player.velocity, wishVector(walkInput.state, euler.y), speed, dt);
    } else {
      player.velocity.x = 0; // keep falling/settling, but don't walk
      player.velocity.z = 0;
    }

    stepMover(colliderRef.current, player, dt);

    // Steps move the feet instantly; ease the camera so stairs glide instead of pop.
    eyeY.current = smoothTowards(eyeY.current, player.position.y + EYE_HEIGHT, 18, dt);
    camera.position.set(player.position.x, eyeY.current, player.position.z);
  });

  return null;
}