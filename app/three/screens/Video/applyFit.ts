import type * as THREE from "three";
import type { FitLayout } from "@/app/lib/videoFit";

/** Sets the crop on a texture. Always writes all four numbers, so switching cover -> contain resets it. */
export function applyFitToTexture(
  texture: Pick<THREE.Texture, "repeat" | "offset">,
  layout: FitLayout,
): void {
  texture.repeat.set(layout.repeat[0], layout.repeat[1]);
  texture.offset.set(layout.offset[0], layout.offset[1]);
}