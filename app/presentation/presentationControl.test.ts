import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/lib/fullscreen", () => ({
  enterFullscreen: vi.fn(async () => ({ ok: true })),
  exitFullscreen: vi.fn(async () => ({ ok: true })),
}));

import { enterFullscreen, exitFullscreen } from "@/app/lib/fullscreen";
import { useSceneStore } from "./../store/useSceneStore";
import { useScreenStore } from "./..//store/useScreenStore";
import { useUiStore } from "./..//store/useUiStore";
import {
  enterPresentation,
  exitPresentation,
  startPresentationGuard,
  toggleView,
} from "./presentationControl";

beforeEach(() => {
  vi.clearAllMocks();
  exitPresentation();
  useUiStore.setState({ presentation: false, mode: "overview", placing: false });
  useSceneStore.setState({ model: { kind: "sample" } });
  useScreenStore.setState({ screens: [], selectedId: null });
});

describe("enterPresentation", () => {
  it("refuses without a model", () => {
    useSceneStore.setState({ model: null });
    expect(enterPresentation({ fullscreen: false })).toBe(false);
    expect(useUiStore.getState().presentation).toBe(false);
  });

  it("clears the selection and the Place tool", () => {
    useScreenStore.getState().add();
    useUiStore.setState({ placing: true });
    expect(enterPresentation({ fullscreen: false })).toBe(true);
    expect(useUiStore.getState()).toMatchObject({ presentation: true, placing: false });
    expect(useScreenStore.getState().selectedId).toBeNull();
  });

  it("asks for fullscreen only when told to", () => {
    enterPresentation({ fullscreen: false });
    expect(enterFullscreen).not.toHaveBeenCalled();
    exitPresentation();
    enterPresentation({ fullscreen: true });
    expect(enterFullscreen).toHaveBeenCalledTimes(1);
  });
});

describe("exitPresentation", () => {
  it("resumes the mode it was entered from and leaves fullscreen", () => {
    useUiStore.setState({ mode: "walk" });
    enterPresentation({ fullscreen: false });
    toggleView();
    expect(useUiStore.getState().mode).toBe("overview");
    exitPresentation();
    expect(useUiStore.getState()).toMatchObject({ presentation: false, mode: "walk" });
    expect(exitFullscreen).toHaveBeenCalled();
  });

  it("is a no-op when not presenting", () => {
    exitPresentation();
    expect(exitFullscreen).not.toHaveBeenCalled();
  });
});

describe("startPresentationGuard", () => {
  it("ends presentation when the model is closed", () => {
    const stop = startPresentationGuard();
    enterPresentation({ fullscreen: false });
    useSceneStore.setState({ model: null });
    expect(useUiStore.getState().presentation).toBe(false);
    stop();
  });
});

describe("toggleView", () => {
  it("flips between overview and walk", () => {
    toggleView();
    expect(useUiStore.getState().mode).toBe("walk");
    toggleView();
    expect(useUiStore.getState().mode).toBe("overview");
  });
});