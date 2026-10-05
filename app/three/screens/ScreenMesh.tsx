import { memo } from "react";
import type * as THREE from "three";
import type { Screen } from "./../../lib/schema";
import { ACCENT_COLOR, SCREEN_EMPTY_COLOR } from "../scene/theme";

const OUTLINE_OFFSET = 0.003; // m, in front of the plane so the line never z-fights with it
const OUTLINE_POINTS = new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]);

type Props = {
  screen: Screen;
  selected: boolean;
  groupRef?: (group: THREE.Group | null) => void; // given to the selected screen so the gizmo can attach
};

/** One screen: a unit plane scaled to its real size in meters. Front side only. */
export const ScreenMesh = memo(function ScreenMesh({ screen, selected, groupRef }: Props) {
  const scale: [number, number, number] = [screen.width, screen.height, 1];

   return (
    <group ref={groupRef} position={screen.position} rotation={screen.rotation} rotation-order="YXZ">
      <mesh scale={scale} userData={{ screenId: screen.id }}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={SCREEN_EMPTY_COLOR} toneMapped={false} />
      </mesh>
      {selected && (
        <lineLoop position={[0, 0, OUTLINE_OFFSET]} scale={scale} raycast={() => {}}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[OUTLINE_POINTS, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={ACCENT_COLOR} toneMapped={false} />
        </lineLoop>
      )}
    </group>
  );
});