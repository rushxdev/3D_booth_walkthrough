import { describe, expect, it } from "vitest";
import { modelKeyFor, SAMPLE_MODEL_KEY } from "./modelKey";

describe("modelKeyFor", () => {
  it("is deterministic and 8 hex characters", () => {
    const a = modelKeyFor("booth.glb", 1234);
    expect(a).toBe(modelKeyFor("booth.glb", 1234));
    expect(a).toMatch(/^[0-9a-f]{8}$/);
  });

  it("changes with the name or the size", () => {
    const base = modelKeyFor("booth.glb", 1234);
    expect(modelKeyFor("booth2.glb", 1234)).not.toBe(base);
    expect(modelKeyFor("booth.glb", 1235)).not.toBe(base);
  });

  it("handles unicode names and odd sizes", () => {
    expect(modelKeyFor("стенд 展台.glb", 10)).toMatch(/^[0-9a-f]{8}$/);
    expect(modelKeyFor("a", -5)).toBe(modelKeyFor("a", 0));
  });

  it("never collides with the sample key", () => {
    expect(modelKeyFor("sample", 0)).not.toBe(SAMPLE_MODEL_KEY);
  });
});