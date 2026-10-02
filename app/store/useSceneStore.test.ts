import { beforeEach, describe, expect, it } from "vitest";
import { useSceneStore } from "./useSceneStore";

describe("useSceneStore model slice", () => {
  beforeEach(() => useSceneStore.setState({ model: null }));

  it("starts empty", () => {
    expect(useSceneStore.getState().model).toBeNull();
  });

  it("loads the sample and clears it", () => {
    useSceneStore.getState().loadSample();
    expect(useSceneStore.getState().model).toEqual({ kind: "sample" });
    useSceneStore.getState().clearModel();
    expect(useSceneStore.getState().model).toBeNull();
  });
});