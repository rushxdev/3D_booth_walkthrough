import { exitFullscreen, enterFullscreen } from "@/app/lib/fullscreen";
import { useSceneStore } from "./..//store/useSceneStore";
import { useScreenStore } from "./..//store/useScreenStore";
import { useUiStore } from "./../store/useUiStore";
import { playAll } from "./../three/screens/Video/videoPlayer";

type Mode = ReturnType<typeof useUiStore.getState>["mode"];

/** What to resume on exit. Camera poses join this in Batch 2 (10.6). */
let entry: { mode: Mode } | null = null;

/** Returns false (and does nothing) when there is no model to present. */
export function enterPresentation({ fullscreen }: { fullscreen: boolean }): boolean {
  const ui = useUiStore.getState();
  if (ui.presentation) return true;
  if (!useSceneStore.getState().model) return false;

  entry = { mode: ui.mode };
  useScreenStore.getState().select(null); // outlines and the gizmo follow the selection
  ui.setPlacing(false);
  ui.setPresentation(true);
  playAll();
  if (fullscreen) void enterFullscreen(); // denial is fine: the bar has a toggle
  return true;
}

export function exitPresentation(): void {
  const ui = useUiStore.getState();
  if (!ui.presentation) return;

  const saved = entry;
  entry = null;
  ui.setPresentation(false);
  const { mode } = useUiStore.getState();
  if (saved && saved.mode !== mode && useSceneStore.getState().model) ui.setMode(saved.mode);
  void exitFullscreen();
}

export function togglePresentation(opts: { fullscreen: boolean }): void {
  if (useUiStore.getState().presentation) exitPresentation();
  else enterPresentation(opts);
}

export function toggleView(): void {
  const { mode, setMode } = useUiStore.getState();
  setMode(mode === "overview" ? "walk" : "overview");
}

/** Ends presentation when the model goes away. Returns the unsubscribe function. */
export function startPresentationGuard(): () => void {
  return useSceneStore.subscribe((s, p) => {
    if (p.model && !s.model) exitPresentation();
  });
}