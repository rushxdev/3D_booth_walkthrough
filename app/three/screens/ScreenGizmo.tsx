"use client";

import { useEffect, useRef } from "react";
import type { ComponentRef } from "react";
import { TransformControls } from "@react-three/drei";
import type * as THREE from "three";
import type { Screen } from "./../../lib/schema";
import { useScreenStore } from "./../../store/useScreenStore";
import { useUiStore } from "./../../store/useUiStore";
import { SNAP_ROTATION, SNAP_TRANSLATION, gizmo } from "./gizmoState";

/** Move / rotate handles on one screen. Writes every change to the store, so the panel stays in sync. */
export function ScreenGizmo({ screen, object }: { screen: Screen; object: THREE.Group }) {
  const update = useScreenStore((s) => s.update);
  const mode = useUiStore((s) => s.gizmoMode);
  const snap = useUiStore((s) => s.snap);
  const ref = useRef<ComponentRef<typeof TransformControls>>(null);

  useEffect(() => {
    gizmo.controls = ref.current as unknown as typeof gizmo.controls;
    return () => {
      gizmo.controls = null;
    };
  }, []);

  return (
    <TransformControls
      ref={ref}
      object={object}
      mode={mode}
      size={0.8}
      translationSnap={snap ? SNAP_TRANSLATION : null}
      rotationSnap={snap ? SNAP_ROTATION : null}
      onObjectChange={() =>
        update(screen.id, {
          position: [object.position.x, object.position.y, object.position.z],
          rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
        })
      }
    />
  );
}