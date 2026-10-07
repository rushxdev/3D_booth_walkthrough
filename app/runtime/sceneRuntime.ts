import { exitPresentation } from "./../presentation/presentationControl";
import { clearCameraResume } from "./../presentation/cameraResume";
import { useGraphicsStore } from "./../store/useGraphicsStore";
import { useUiStore } from "./../store/useUiStore";
import { clearColliderCache } from "./../three/collision/colliderCache";
import { orbitView } from "./../three/controls/orbitView";
import { player } from "./../three/controls/player";

/** Runs the moment the canvas crashes: make the rest of the UI usable again. */
export function onCanvasCrash(): void {
  exitPresentation(); // the toolbar is hidden while presenting
  useUiStore.setState({ walkLocked: false }); // the unmounted canvas can no longer report an unlock
  useUiStore.getState().setMode("overview"); // hides "Click to enter" and avoids re-crashing in Walk
}

/** Resets everything that lives outside React, before a fresh canvas is mounted. */
export function resetSceneRuntime(): void {
  clearColliderCache();
  player.position.set(0, 0, 0);
  player.velocity.set(0, 0, 0);
  player.grounded = false;
  orbitView.valid = false; // the new canvas frames the model instead of restoring a stale view
  clearCameraResume();
  useUiStore.setState({ walkLocked: false });
  useUiStore.getState().setMode("overview");
  useGraphicsStore.getState().reset();
}