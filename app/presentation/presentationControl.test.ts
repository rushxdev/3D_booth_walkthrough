import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./../lib/fullscreen", () => ({
  enterFullscreen: vi.fn(async () => ({ ok: true })),
  exitFullscreen: vi.fn(async () => ({ ok: true })),
}));

import { enterFullscreen, exitFullscreen } from "./../lib/fullscreen";
import { useSceneStore } from "./../store/useSceneStore";
import { useScreenStore } from "./..//store/useScreenStore";
import { useUiStore } from "./..//store/useUiStore";
import {
  enterPresentation,
  exitPresentation,
  startPresentationGuard,
  toggleView,
} from "./presentationControl";
import { orbitView, saveOrbitView } from "./../three/controls/orbitView";
import { takeOrbitResume } from "./cameraResume";
import * as THREE from "three";

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

describe("camera resume", () => {
  it("puts the entry orbit view back, even after the client moved", () => {
    saveOrbitView(new THREE.Vector3(1, 2, 3), new THREE.Vector3(0, 0, 0), "m", 0);
    enterPresentation({ fullscreen: false });
    saveOrbitView(new THREE.Vector3(9, 9, 9), new THREE.Vector3(1, 1, 1), "m", 0); // client orbited
    exitPresentation();
    expect(orbitView.position.toArray()).toEqual([1, 2, 3]);
    expect(takeOrbitResume()?.position).toEqual([1, 2, 3]);
  });

  it("does not restore onto a different model", () => {
    saveOrbitView(new THREE.Vector3(1, 2, 3), new THREE.Vector3(0, 0, 0), "m", 0);
    enterPresentation({ fullscreen: false });
    saveOrbitView(new THREE.Vector3(9, 9, 9), new THREE.Vector3(1, 1, 1), "m", 0);
    useSceneStore.setState({
      model: { kind: "file", name: "x.glb", size: 1, unit: "m" } as never,
    });
    exitPresentation();
    expect(orbitView.position.toArray()).toEqual([9, 9, 9]);
    expect(takeOrbitResume()).toBeNull();
  });
});