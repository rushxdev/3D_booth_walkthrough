import { describe, expect, it } from "vitest";
import { labelCanvasSize, screenLabelLines } from "./screenLabel";

describe("screenLabelLines", () => {
  it("shows the name and the size in meters", () => {
    expect(screenLabelLines("Screen 1", 1.6, 0.9)).toEqual({
      title: "Screen 1",
      subtitle: "1.6 × 0.9 m",
    });
  });
  it("rounds to two decimals and drops trailing zeros", () => {
    expect(screenLabelLines("a", 3.456, 2).subtitle).toBe("3.46 × 2 m");
  });
});

describe("labelCanvasSize", () => {
  it("keeps the aspect with the longer side at 512", () => {
    expect(labelCanvasSize(16, 9)).toEqual([512, 288]);
    expect(labelCanvasSize(9, 16)).toEqual([288, 512]);
    expect(labelCanvasSize(1, 1)).toEqual([512, 512]);
  });
  it("clamps extreme aspects and survives invalid input", () => {
    expect(labelCanvasSize(100, 1)).toEqual([512, 64]);
    expect(labelCanvasSize(1, 100)).toEqual([64, 512]);
    expect(labelCanvasSize(NaN, 1)).toEqual([512, 512]);
    expect(labelCanvasSize(1, 0)).toEqual([512, 512]);
  });
});