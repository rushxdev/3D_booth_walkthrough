import { useVideoStore } from "./../../../store/useVideoStore";
import { getPlayer, playerIds } from "./videoPlayer";

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

export function setAllMuted(muted: boolean): void {
  for (const id of playerIds()) {
    getPlayer(id)?.setMuted(muted);
    useVideoStore.getState().patch(id, { muted });
  }
}