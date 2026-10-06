import { useScreenStore } from "./../../../store/useScreenStore";
import { pruneVideoSources, videoSourceCount } from "./videoSources";

/**
 * Frees video sources that no screen references. Runs once, then on every change to the
 * screens list. Returns the unsubscribe function (safe for Strict Mode).
 */
export function startVideoSourceSync(): () => void {
  const run = (screens: ReturnType<typeof useScreenStore.getState>["screens"]) => {
    if (videoSourceCount() === 0) return;
    pruneVideoSources(screens.map((s) => s.content.src));
  };
  run(useScreenStore.getState().screens);
  return useScreenStore.subscribe((state, prev) => {
    if (state.screens !== prev.screens) run(state.screens);
  });
}