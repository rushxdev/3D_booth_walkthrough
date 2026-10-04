import { describe, expect, it } from "vitest";
import { defaultScreenPlacement, offsetAlongRight, yawToward } from "./placement";

describe("yawToward", () => {
  it("is 0 when the viewer is in front (+Z), a quarter turn at +X, and half a turn behind", () => {
    expect(yawToward({ x: 0, z: 0 }, { x: 0, z: 5 })).toBeCloseTo(0, 10);
    expect(yawToward({ x: 0, z: 0 }, { x: 5, z: 0 })).toBeCloseTo(Math.PI / 2, 10);
    expect(Math.abs(yawToward({ x: 0, z: 0 }, { x: 0, z: -5 }))).toBeCloseTo(Math.PI, 10);
  });
  it("is 0 when directly above or below", () => {
    expect(yawToward({ x: 1, z: 1 }, { x: 1, z: 1 })).toBe(0);
  });
});

describe("offsetAlongRight", () => {
  it("follows the screen's right side", () => {
    expect(offsetAlongRight([0, 1, 0], [0, 0, 0], 0.3)[0]).toBeCloseTo(0.3, 10);
    const turned = offsetAlongRight([0, 1, 0], [0, Math.PI / 2, 0], 0.3); // right is now -Z
    expect(turned[0]).toBeCloseTo(0, 10);
    expect(turned[2]).toBeCloseTo(-0.3, 10);
  });
});

describe("defaultScreenPlacement", () => {
  it("faces the viewer and keeps the bottom edge above the floor", () => {
    const p = defaultScreenPlacement([0, 0.1, 0], [10, 6, 10], 0.9);
    expect(p.position[1]).toBeCloseTo(0.45, 10); // half the height
    expect(p.rotation[1]).toBeCloseTo(Math.PI / 4, 10);
  });
  it("leaves a high anchor where it is", () => {
    expect(defaultScreenPlacement([0, 1.5, 0], [0, 1.6, 5], 0.9).position[1]).toBe(1.5);
  });
});