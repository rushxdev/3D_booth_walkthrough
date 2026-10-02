import { beforeEach, describe, expect, it } from "vitest";
import { isViewMode, useUiStore } from "./useUiStore";

describe("useUiStore", () => {
  beforeEach(() => useUiStore.setState({ mode: "overview", frameTick: 0 }));

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
});