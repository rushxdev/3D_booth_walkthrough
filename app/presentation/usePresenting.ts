import { useSceneStore } from "@/app/store/useSceneStore";
import { useUiStore } from "@/app/store/useUiStore";

/** React gate: presentation is on and there is a model to present. */
export function usePresenting(): boolean {
  const flag = useUiStore((s) => s.presentation);
  const hasModel = useSceneStore((s) => s.model !== null);
  return flag && hasModel;
}

/** Same gate for event handlers and per-frame code. */
export const isPresenting = (): boolean =>
  useUiStore.getState().presentation && useSceneStore.getState().model !== null;