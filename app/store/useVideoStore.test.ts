import { beforeEach, describe, expect, it } from "vitest";
import { useVideoStore } from "./useVideoStore";

beforeEach(() => useVideoStore.getState().reset());

describe("useVideoStore", () => {
  it("creates a muted loading status on first patch", () => {
    useVideoStore.getState().patch("s1", { aspect: 1.5 });
    const s = useVideoStore.getState().byScreen.s1;
    expect(s).toMatchObject({ phase: "loading", muted: true, playing: false, aspect: 1.5 });
  });

  it("merges later patches and keeps other screens untouched", () => {
    const { patch } = useVideoStore.getState();
    patch("s1", { phase: "ready" });
    patch("s2", { phase: "error", message: "x" });
    patch("s1", { playing: true });
    const { byScreen } = useVideoStore.getState();
    expect(byScreen.s1).toMatchObject({ phase: "ready", playing: true });
    expect(byScreen.s2.phase).toBe("error");
  });

  it("clear removes one screen and is a no-op for unknown ids", () => {
    const { patch, clear } = useVideoStore.getState();
    patch("s1", {});
    clear("nope");
    expect(useVideoStore.getState().byScreen.s1).toBeDefined();
    clear("s1");
    expect(useVideoStore.getState().byScreen.s1).toBeUndefined();
  });
});