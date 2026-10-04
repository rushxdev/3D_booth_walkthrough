import type { RefObject } from "react";
import type * as THREE from "three";
import { useScreenStore } from "./../../store/useScreenStore";
import { ScreenMesh } from "./ScreenMesh";

/** All visible screens. Hidden ones aren't rendered, so they can't be picked either. */
export function Screens({ groupRef }: { groupRef: RefObject<THREE.Group | null> }) {
  const screens = useScreenStore((s) => s.screens);
  const selectedId = useScreenStore((s) => s.selectedId);

  return (
    <group ref={groupRef}>
      {screens
        .filter((s) => s.visible)
        .map((s) => (
          <ScreenMesh key={s.id} screen={s} selected={s.id === selectedId} />
        ))}
    </group>
  );
}