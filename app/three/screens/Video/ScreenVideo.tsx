import { useEffect, useMemo, useState } from "react";
import { computeFit } from "@/app/lib/videoFit";
import type { FitMode } from "@/app/lib/schema";
import { initialVideoStatus, useVideoStore } from "@/app/store/useVideoStore";
import { applyFitToTexture } from "./applyFit";
import { createVideoPlayer, registerPlayer, type VideoPlayer } from "./videoPlayer";
import { getVideoUrl } from "./videoSources";

const VIDEO_OFFSET = 0.001; // m in front of the backing plane; polygonOffset handles the rest
const MISSING_MESSAGE = "The video file isn't available. Choose it again.";
const NO_RAYCAST = () => {};

type Props = { screenId: string; src: string; fit: FitMode; width: number; height: number };

/**
 * Owns one screen's video element and texture, and draws the picture quad.
 * The player lives and dies with [screenId, src]; size and fit changes never recreate it.
 */
export function ScreenVideo({ screenId, src, fit, width, height }: Props) {
  const [player, setPlayer] = useState<VideoPlayer | null>(null);
  const aspect = useVideoStore((s) => s.byScreen[screenId]?.aspect ?? null);
  const phase = useVideoStore((s) => s.byScreen[screenId]?.phase);

  useEffect(() => {
    const { patch, clear } = useVideoStore.getState();
    patch(screenId, initialVideoStatus());

    const url = getVideoUrl(src);
    if (!url) {
      patch(screenId, { phase: "error", message: MISSING_MESSAGE });
      return () => clear(screenId);
    }

    const p = createVideoPlayer(url, {
      onMetadata: (a) => patch(screenId, { phase: "ready", aspect: a }),
      onError: (message) => patch(screenId, { phase: "error", message }),
      onPlayingChange: (playing) => patch(screenId, { playing }),
    });
    const unregister = registerPlayer(screenId, p);
    setPlayer(p);
    void p.play();

    return () => {
      unregister();
      p.dispose();
      setPlayer((cur) => (cur === p ? null : cur));
      clear(screenId);
    };
  }, [screenId, src]);

  const layout = useMemo(
    () => (aspect ? computeFit(aspect, width / height, fit) : null),
    [aspect, width, height, fit],
  );

  useEffect(() => {
    if (player && layout) applyFitToTexture(player.texture, layout);
  }, [player, layout]);

  if (!player || !layout || phase !== "ready") return null;

  return (
    <mesh
      position={[0, 0, VIDEO_OFFSET]}
      scale={[width * layout.quad[0], height * layout.quad[1], 1]}
      raycast={NO_RAYCAST}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        key={player.texture.uuid}
        map={player.texture}
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}