import { describe, expect, it } from "vitest";
import { canRestoreOrbit } from "./orbitView";

describe("canRestoreOrbit", () => {
  const view = { valid: true, modelKey: "sample", frameTick: 2 };
  it("restores for the same model and frame request", () => {
    expect(canRestoreOrbit(view, "sample", 2)).toBe(true);
  });
  it("does not restore for another model, a new Frame request, or nothing saved", () => {
    expect(canRestoreOrbit(view, "other:cm", 2)).toBe(false);
    expect(canRestoreOrbit(view, "sample", 3)).toBe(false);
    expect(canRestoreOrbit({ ...view, valid: false }, "sample", 2)).toBe(false);
  });
});