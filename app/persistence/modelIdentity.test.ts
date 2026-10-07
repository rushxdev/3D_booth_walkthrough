import { describe, expect, it } from "vitest";
import { modelKeyFor, SAMPLE_MODEL_KEY } from "./../lib/modelKey";
import type { ModelSource } from "@/app/store/useSceneStore";
import { modelIdentity } from "./modelIdentity";

const file = (unit: string) =>
  ({ kind: "file", name: "booth.glb", size: 1234, unit }) as unknown as ModelSource;

describe("modelIdentity", () => {
  it("is null without a model", () => {
    expect(modelIdentity(null)).toBeNull();
  });
  it("uses the fixed key for the sample", () => {
    expect(modelIdentity({ kind: "sample" })).toEqual({ key: SAMPLE_MODEL_KEY, name: "Sample booth", unit: "m" });
  });
  it("hashes name and size for files, and reports the current unit", () => {
    expect(modelIdentity(file("cm"))).toEqual({ key: modelKeyFor("booth.glb", 1234), name: "booth.glb", unit: "cm" });
  });
  it("keeps the same key when only the unit changes", () => {
    expect(modelIdentity(file("cm"))?.key).toBe(modelIdentity(file("mm"))?.key);
  });
});