import { afterEach, describe, expect, it, vi } from "vitest";
import { useVideoStore } from "./../../../store/useVideoStore";
import { registerPlayer, type VideoPlayer } from "./videoPlayer";
import { setAllMuted, toggleMute, togglePlay } from "./videoControls";

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

  it("setAllMuted mutes or unmutes every registered player and records it", () => {
    const a = fakePlayer(false, true);
    const b = fakePlayer(false, true);
    const offA = registerPlayer("a", a);
    const offB = registerPlayer("b", b);
    setAllMuted(false);
    expect(a.video.muted).toBe(false);
    expect(useVideoStore.getState().byScreen.b.muted).toBe(false);
    setAllMuted(true);
    expect(b.video.muted).toBe(true);
    offA();
    offB();
  });
});