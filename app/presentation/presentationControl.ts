import { exitFullscreen, enterFullscreen } from "./../lib/fullscreen";
import { useSceneStore } from "./..//store/useSceneStore";
import { useScreenStore } from "./..//store/useScreenStore";
import { useUiStore } from "./../store/useUiStore";
import { playAll } from "./../three/screens/Video/videoPlayer";
import { modelIdentity } from "./../persistence/modelIdentity";
import { captureCamera, clearCameraResume, restoreCamera, type CameraSnapshot } from "./cameraResume";

type Mode = ReturnType<typeof useUiStore.getState>["mode"];

/** What to resume on exit: the mode and the camera it was in. */
let entry: { mode: Mode; camera: CameraSnapshot } | null = null;

const identityKeyNow = () => modelIdentity(useSceneStore.getState().model)?.key ?? "";

/** Returns false (and does nothing) when there is no model to present. */
export function enterPresentation({ fullscreen }: { fullscreen: boolean }): boolean {
  const ui = useUiStore.getState();
  if (ui.presentation) return true;
  if (!useSceneStore.getState().model) return false;

  clearCameraResume();
  entry = { mode: ui.mode, camera: captureCamera(ui.mode, identityKeyNow()) };
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
  if (saved) {
    // Before the mode switch: a controller that remounts reads the restored orbitView.
    restoreCamera(saved.camera, {
      identityKey: identityKeyNow(),
      frameTick: useUiStore.getState().frameTick,
      finalMode: saved.mode,
    });
    const { mode } = useUiStore.getState();
    if (saved.mode !== mode && useSceneStore.getState().model) ui.setMode(saved.mode);
  }
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