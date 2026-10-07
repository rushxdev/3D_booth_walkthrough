import { useVideoStore } from "./../../../store/useVideoStore";
import { getPlayer } from "./videoPlayer";

export function togglePlay(screenId: string): void {
  const p = getPlayer(screenId);
  if (!p) return;
  if (p.video.paused) void p.play();
  else p.pause();
}

export function toggleMute(screenId: string): void {
  const p = getPlayer(screenId);
  if (!p) return;
  p.setMuted(!p.video.muted);
  useVideoStore.getState().patch(screenId, { muted: p.video.muted });
}