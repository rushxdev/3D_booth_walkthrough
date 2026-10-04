import { DEFAULT_SCREEN_SIZE } from "./../../lib/schema";
import type { Vec3 } from "./../../lib/schema";
import { useScreenStore } from "./../../store/useScreenStore";
import { useUiStore } from "./../../store/useUiStore";
import { cameraPose } from "../controls/cameraPose";
import { orbitView } from "../controls/orbitView";
import { defaultScreenPlacement } from "./placement";

const WALK_DISTANCE = 2.5; // meters ahead of the player
const WALK_HEIGHT = 1.5;
const FALLBACK_ANCHOR: Vec3 = [0, 1.5, 0];

/** Adds a default screen where the user is looking and returns its id. */
export function addScreenInView(): string {
  const viewer: Vec3 = [cameraPose.position.x, cameraPose.position.y, cameraPose.position.z];

  let anchor: Vec3;
  if (useUiStore.getState().mode === "walk") {
    const { x, z } = cameraPose.direction;
    const length = Math.hypot(x, z);
    // looking straight up or down: fall back to a fixed heading
    const fx = length > 1e-3 ? x / length : 0;
    const fz = length > 1e-3 ? z / length : -1;
    anchor = [viewer[0] + fx * WALK_DISTANCE, WALK_HEIGHT, viewer[2] + fz * WALK_DISTANCE];
  } else {
    anchor = orbitView.valid ? [orbitView.target.x, orbitView.target.y, orbitView.target.z] : FALLBACK_ANCHOR;
  }

  return useScreenStore.getState().add(defaultScreenPlacement(anchor, viewer, DEFAULT_SCREEN_SIZE.height));
}