import { describe, expect, it } from "vitest";
import { clamp, formatNumber, parseNumber, roundTo } from "./number";

describe("parseNumber", () => {
  it("parses plain, comma-decimal and padded input", () => {
    expect(parseNumber("3.2")).toBe(3.2);
    expect(parseNumber("3,2")).toBe(3.2);
    expect(parseNumber("  -4 ")).toBe(-4);
  });
  it("rejects empty and non-numeric input", () => {
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
    expect(parseNumber("Infinity")).toBeNull();
    expect(parseNumber("1.2.3")).toBeNull();
  });
});

describe("formatNumber", () => {
  it("trims trailing zeros and guards non-finite", () => {
    expect(formatNumber(1.5, 3)).toBe("1.5");
    expect(formatNumber(2, 2)).toBe("2");
    expect(formatNumber(NaN, 2)).toBe("");
  });
});

describe("clamp / roundTo", () => {
  it("clamps to range", () => {
    expect(clamp(99, 0.1, 50)).toBe(50);
    expect(clamp(-1, 0.1, 50)).toBe(0.1);
  });
  it("removes float noise", () => {
    expect(roundTo(0.1 + 0.2, 3)).toBe(0.3);
  });
});