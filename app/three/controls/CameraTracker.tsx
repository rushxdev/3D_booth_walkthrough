"use client";

import { useGuardedFrame } from "./useGuardedFrame";
import { cameraPose } from "./cameraPose";

export function CameraTracker() {
  useGuardedFrame("camera-tracker", ({ camera }) => {
    cameraPose.position.copy(camera.position);
    camera.getWorldDirection(cameraPose.direction);
  });
  return null;
}