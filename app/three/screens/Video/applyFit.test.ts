import { describe, expect, it } from "vitest";
import { Vector2 } from "three";
import { computeFit } from "./../../../lib/videoFit";
import { applyFitToTexture } from "./applyFit";

const tex = () => ({ repeat: new Vector2(1, 1), offset: new Vector2(0, 0) });

describe("applyFitToTexture", () => {
  it("applies the crop for cover", () => {
    const t = tex();
    applyFitToTexture(t, computeFit(16 / 9, 9 / 16, "cover"));
    expect(t.repeat.x).toBeCloseTo(81 / 256, 6);
    expect(t.repeat.y).toBe(1);
    expect(t.offset.x).toBeCloseTo((1 - 81 / 256) / 2, 6);
  });

  it("resets the crop when switching back to contain", () => {
    const t = tex();
    applyFitToTexture(t, computeFit(16 / 9, 9 / 16, "cover"));
    applyFitToTexture(t, computeFit(16 / 9, 9 / 16, "contain"));
    expect(t.repeat.toArray()).toEqual([1, 1]);
    expect(t.offset.toArray()).toEqual([0, 0]);
  });
});