import { useState } from "react";
import type { RefObject } from "react";
import type * as THREE from "three";
import { useScreenStore } from "./../../store/useScreenStore";
import { useUiStore } from "./../../store/useUiStore";
import { ScreenGizmo } from "./ScreenGizmo";
import { ScreenMesh } from "./ScreenMesh";

/** All visible screens, plus the gizmo on the selected one. Hidden screens aren't rendered or pickable. */
export function Screens({ groupRef }: { groupRef: RefObject<THREE.Group | null> }) {
  const screens = useScreenStore((s) => s.screens);
  const selectedId = useScreenStore((s) => s.selectedId);
  const mode = useUiStore((s) => s.mode);
  const placing = useUiStore((s) => s.placing);
  const [selectedGroup, setSelectedGroup] = useState<THREE.Group | null>(null);

  const selected = screens.find((s) => s.id === selectedId);
  const showGizmo = mode === "overview" && !placing && selected && selected.visible && !selected.locked && selectedGroup;

  return (
    <>
      <group ref={groupRef}>
        {screens
          .filter((s) => s.visible)
          .map((s) => (
            <ScreenMesh key={s.id} screen={s} selected={s.id === selectedId} groupRef={s.id === selectedId ? setSelectedGroup : undefined} />
          ))}
      </group>
      {showGizmo && selected && <ScreenGizmo key={selected.id} screen={selected} object={selectedGroup} />}
    </>
  );
}