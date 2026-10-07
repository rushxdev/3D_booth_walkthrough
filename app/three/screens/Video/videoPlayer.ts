import * as THREE from "three";
import { describeMediaError, NO_PICTURE_MESSAGE } from "./../../../lib/videoFile";

export type VideoPlayerEvents = {
  onMetadata: (aspect: number) => void;
  onError: (message: string) => void;
  onPlayingChange: (playing: boolean) => void;
};

export type VideoPlayer = {
  video: HTMLVideoElement;
  texture: THREE.VideoTexture;
  play: () => Promise<void>;
  pause: () => void;
  setMuted: (muted: boolean) => void;
  dispose: () => void;
};

/**
 * Creates the element and texture for one screen. The caller owns it and must
 * call dispose(): R3F only auto-disposes declarative children.
 * Safe to call dispose() more than once.
 */
export function createVideoPlayer(url: string, events: VideoPlayerEvents): VideoPlayer {
  const video = document.createElement("video");
  video.muted = true; // autoplay policy
  video.loop = true;
  video.playsInline = true;
  video.preload = "auto";
  // No crossOrigin: sources are same-origin blob: URLs.

  const abort = new AbortController();
  const opts = { signal: abort.signal };

  video.addEventListener(
    "loadedmetadata",
    () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        events.onMetadata(video.videoWidth / video.videoHeight);
      } else {
        events.onError(NO_PICTURE_MESSAGE);
      }
    },
    opts,
  );
  video.addEventListener("error", () => events.onError(describeMediaError(video.error?.code)), opts);
  video.addEventListener("play", () => events.onPlayingChange(true), opts);
  video.addEventListener("pause", () => events.onPlayingChange(false), opts);

  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;

  let disposed = false;
  video.src = url;

  return {
    video,
    texture,
    async play() {
      if (disposed) return;
      try {
        await video.play();
      } catch {
        // Autoplay blocked or load interrupted: stay paused, the Play button still works.
      }
    },
    pause() {
      if (!disposed) video.pause();
    },
    setMuted(muted) {
      if (!disposed) video.muted = muted;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      abort.abort();
      video.pause();
      video.removeAttribute("src");
      video.load(); // releases the decoder and the file handle
      texture.dispose();
    },
  };
}

/* Registry so toolbar and panel controls can reach players without React state. */
const players = new Map<string, VideoPlayer>();

export function registerPlayer(screenId: string, player: VideoPlayer): () => void {
  players.set(screenId, player);
  return () => {
    if (players.get(screenId) === player) players.delete(screenId);
  };
}

export const getPlayer = (screenId: string) => players.get(screenId);
export const playerIds = () => [...players.keys()];
export const playAll = () => players.forEach((p) => void p.play());
export const pauseAll = () => players.forEach((p) => p.pause());