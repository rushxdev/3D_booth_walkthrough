import { useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { RootState } from "@react-three/fiber";
import { createFrameGuard } from "./../../runtime/frameGuard";
import { useFaultStore } from "./../../store/useFaultStore";

/** `useFrame`, but a throwing callback is contained and a persistent failure becomes a visible fault. */
export function useGuardedFrame(
  source: string,
  callback: (state: RootState, delta: number) => void,
  priority?: number,
): void {
  const [run] = useState(() =>
    createFrameGuard(source, { onFault: (s, error) => useFaultStore.getState().report(s, error) }),
  );
  useFrame((state, delta) => run(() => callback(state, delta)), priority);
}