"use client";

import { useFrame } from "@react-three/fiber";
import { cameraPose } from "./cameraPose";

export function CameraTracker() {
  useFrame(({ camera }) => {
    cameraPose.position.copy(camera.position);
    camera.getWorldDirection(cameraPose.direction);
  });
  return null;
}