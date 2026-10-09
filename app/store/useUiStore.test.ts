import { beforeEach, describe, expect, it } from "vitest";
import { isViewMode, useUiStore } from "./useUiStore";

describe("useUiStore", () => {
  beforeEach(() => useUiStore.setState({ 
    mode: "overview", 
    resetTick: 0, 
    walkLocked: false, 
    walkSpeed: 2, 
    lookSensitivity: 1, 
    lockAspect: false,
    gizmoMode: "translate", 
    snap: false, 
    placing: false
   }));

  it("switches mode", () => {
    useUiStore.getState().setMode("walk");
    expect(useUiStore.getState().mode).toBe("walk");
  });
  it("counts frame requests", () => {
    useUiStore.getState().requestFrame();
    useUiStore.getState().requestFrame();
    expect(useUiStore.getState().frameTick).toBe(2);
  });
  it("narrows strings to modes", () => {
    expect(isViewMode("walk")).toBe(true);
    expect(isViewMode("fly")).toBe(false);
  });
  it("tracks pointer lock", () => {
    useUiStore.getState().setWalkLocked(true);
    expect(useUiStore.getState().walkLocked).toBe(true);
  });
  it("counts reset requests", () => {
    useUiStore.getState().requestReset();
    expect(useUiStore.getState().resetTick).toBe(1);
  });
  it("clamps walk settings and ignores bad input", () => {
    const ui = useUiStore.getState();
    ui.setWalkSpeed(99);
    expect(useUiStore.getState().walkSpeed).toBe(10);
    ui.setWalkSpeed(0.1);
    expect(useUiStore.getState().walkSpeed).toBe(0.5);
    ui.setWalkSpeed(NaN);
    expect(useUiStore.getState().walkSpeed).toBe(0.5);
    ui.setLookSensitivity(9);
    expect(useUiStore.getState().lookSensitivity).toBe(3);
  });
  it("toggles the aspect lock", () => {
    useUiStore.getState().setLockAspect(true);
    expect(useUiStore.getState().lockAspect).toBe(true);
  });
  it("switches the gizmo mode and snapping", () => {
    useUiStore.getState().setGizmoMode("rotate");
    useUiStore.getState().setSnap(true);
    expect(useUiStore.getState().gizmoMode).toBe("rotate");
    expect(useUiStore.getState().snap).toBe(true);
  });
  it("ends the Place tool when the mode changes", () => {
    useUiStore.getState().setPlacing(true);
    useUiStore.getState().setMode("walk");
    expect(useUiStore.getState().placing).toBe(false);
  });
  it("setPresentation(true) ends the Place tool", () => {
    useUiStore.setState({ placing: true, presentation: false });
    useUiStore.getState().setPresentation(true);
    expect(useUiStore.getState()).toMatchObject({ presentation: true, placing: false });
  });
});