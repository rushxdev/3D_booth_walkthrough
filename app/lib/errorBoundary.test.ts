import { describe, expect, it } from "vitest";
import { describeRenderError, resetKeysChanged } from "./errorBoundary";

describe("resetKeysChanged", () => {
  it("is false for equal keys and true for any difference", () => {
    expect(resetKeysChanged(["a", 1], ["a", 1])).toBe(false);
    expect(resetKeysChanged(["a"], ["b"])).toBe(true);
    expect(resetKeysChanged(["a"], ["a", "b"])).toBe(true);
    expect(resetKeysChanged([NaN], [NaN])).toBe(false);
  });
  it("handles missing keys", () => {
    expect(resetKeysChanged(undefined, undefined)).toBe(false);
    expect(resetKeysChanged(undefined, ["a"])).toBe(true);
  });
});

describe("describeRenderError", () => {
  it("recognizes WebGL failures", () => {
    const d = describeRenderError(new Error("Error creating WebGL context."));
    expect(d.webgl).toBe(true);
    expect(d.detail).toMatch(/hardware acceleration/);
  });
  it("gives a generic message for anything else", () => {
    const d = describeRenderError(new Error("x is undefined"));
    expect(d.webgl).toBe(false);
    expect(d.technical).toBe("x is undefined");
  });
  it("survives odd thrown values and long messages", () => {
    expect(describeRenderError(null).title.length).toBeGreaterThan(0);
    expect(describeRenderError("plain string").technical).toBe("plain string");
    expect(describeRenderError({ toString: () => { throw new Error("no"); } }).technical).toBe("");
    expect(describeRenderError(new Error("x".repeat(1000))).technical).toHaveLength(200);
  });
});