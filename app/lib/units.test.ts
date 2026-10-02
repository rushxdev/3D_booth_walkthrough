import { describe, expect, it } from "vitest";
import { guessUnit, isUnit } from "./units";

describe("guessUnit", () => {
  it("trusts meters for booth-sized values", () => {
    for (const v of [1, 3.2, 12, 60]) expect(guessUnit(v)).toBe("m");
  });
  it("detects centimeters and millimeters", () => {
    expect(guessUnit(500)).toBe("cm"); // 5 m booth
    expect(guessUnit(200)).toBe("cm");
    expect(guessUnit(5000)).toBe("mm"); // 5 m booth
    expect(guessUnit(20000)).toBe("mm");
    expect(guessUnit(100000)).toBe("mm");
  });
  it("keeps meters for small or slightly large models rather than guessing", () => {
    expect(guessUnit(0.8)).toBe("m");
    expect(guessUnit(61)).toBe("m");
  });
  it("falls back to meters for bad input", () => {
    for (const v of [0, -5, NaN, Infinity]) expect(guessUnit(v)).toBe("m");
  });
});

describe("isUnit", () => {
  it("narrows strings", () => {
    expect(isUnit("cm")).toBe(true);
    expect(isUnit("yards")).toBe(false);
  });
});