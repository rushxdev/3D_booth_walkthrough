import { memo } from "react";
import type * as THREE from "three";
import type { Screen } from "@/app/lib/schema";
import { useVideoStore } from "@/app/store/useVideoStore";
import { ACCENT_COLOR, SCREEN_EMPTY_COLOR } from "../scene/theme";
import { ScreenVideo } from "./Video/ScreenVideo";
import { useScreenLabelTexture } from "./useScreenLabelTexture";

const OUTLINE_OFFSET = 0.003; // m, in front of the plane so the line never z-fights with it
const OUTLINE_POINTS = new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]);
const LETTERBOX_COLOR = "#0a0a0a"; // bars around a contained video
const round2 = (n: number) => Math.round(n * 100) / 100;

type Props = {
  screen: Screen;
  selected: boolean;
  groupRef?: (group: THREE.Group | null) => void; // given to the selected screen so the gizmo can attach
};

/** One screen: a unit plane scaled to its real size in meters. Front side only. */
export const ScreenMesh = memo(function ScreenMesh({ screen, selected, groupRef }: Props) {
  const scale: [number, number, number] = [screen.width, screen.height, 1];
  const { type, src, fit } = screen.content;

  const hasVideo = type === "video" && !!src;
  const phase = useVideoStore((s) => s.byScreen[screen.id]?.phase);
  // A video that failed falls back to the label so the screen is never a black hole.
  const showVideo = hasVideo && phase !== "error";
  const label = useScreenLabelTexture(screen.name, round2(screen.width), round2(screen.height), !showVideo);

  return (
    <group ref={groupRef} position={screen.position} rotation={screen.rotation} rotation-order="YXZ">
      <mesh scale={scale} userData={{ screenId: screen.id }}>
        <planeGeometry args={[1, 1]} />
        {showVideo ? (
          <meshBasicMaterial key="letterbox" color={LETTERBOX_COLOR} toneMapped={false} />
        ) : (
          <meshBasicMaterial
            key={label ? "label" : "flat"}
            color={label ? "#ffffff" : SCREEN_EMPTY_COLOR}
            map={label ?? undefined}
            toneMapped={false}
          />
        )}
      </mesh>
      {hasVideo && (
        <ScreenVideo screenId={screen.id} src={src} fit={fit} width={screen.width} height={screen.height} />
      )}
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