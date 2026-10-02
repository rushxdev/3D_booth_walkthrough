import { beforeEach, describe, expect, it } from "vitest";
import { useSceneStore } from "./useSceneStore";
import * as THREE from "three";
import type { ModelSource } from "./useSceneStore";

const file: ModelSource = {
  kind: "file",
  name: "a.glb",
  size: 1,
  scene: new THREE.Group(),
  measure: { min: [0, 0, 0], max: [1, 1, 1], meshCount: 1, triangleCount: 12 },
  unit: "m",
  detectedUnit: "m",
};

it("changes a file model's unit, keeps the detected one, and ignores the sample", () => {
  useSceneStore.getState().setModel(file);
  useSceneStore.getState().setModelUnit("cm");
  const m = useSceneStore.getState().model;
  expect(m?.kind === "file" && m.unit).toBe("cm");
  expect(m?.kind === "file" && m.detectedUnit).toBe("m");

  useSceneStore.getState().loadSample();
  useSceneStore.getState().setModelUnit("mm");
  expect(useSceneStore.getState().model).toEqual({ kind: "sample" });
});

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