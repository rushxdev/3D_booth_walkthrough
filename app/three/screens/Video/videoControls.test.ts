import { afterEach, describe, expect, it, vi } from "vitest";
import { useVideoStore } from "./../../../store/useVideoStore";
import { registerPlayer, type VideoPlayer } from "./videoPlayer";
import { toggleMute, togglePlay } from "./videoControls";

function fakePlayer(paused: boolean, muted: boolean) {
  const video = { paused, muted };
  return {
    video,
    play: vi.fn(async () => {}),
    pause: vi.fn(),
    setMuted: vi.fn((m: boolean) => {
      video.muted = m;
    }),
  } as unknown as VideoPlayer & { play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn> };
}

let unregister: () => void = () => {};
afterEach(() => {
  unregister();
  useVideoStore.getState().reset();
});

describe("videoControls", () => {
  it("togglePlay plays a paused video and pauses a playing one", () => {
    const paused = fakePlayer(true, true);
    unregister = registerPlayer("a", paused);
    togglePlay("a");
    expect(paused.play).toHaveBeenCalled();
    unregister();

    const playing = fakePlayer(false, true);
    unregister = registerPlayer("a", playing);
    togglePlay("a");
    expect(playing.pause).toHaveBeenCalled();
  });

  it("toggleMute flips the element and records it in the store", () => {
    const p = fakePlayer(false, true);
    unregister = registerPlayer("a", p);
    toggleMute("a");
    expect(p.video.muted).toBe(false);
    expect(useVideoStore.getState().byScreen.a.muted).toBe(false);
  });

  it("does nothing for an unknown screen", () => {
    expect(() => {
      togglePlay("nope");
      toggleMute("nope");
    }).not.toThrow();
  });
});