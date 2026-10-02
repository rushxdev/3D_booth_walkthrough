import { describe, expect, it } from "vitest";
import { formatBytes } from "./format";

describe("formatBytes", () => {
  it("formats across units", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(160 * 1024 * 1024)).toBe("160 MB");
  });
  it("guards bad input", () => {
    expect(formatBytes(NaN)).toBe("");
    expect(formatBytes(-1)).toBe("");
  });
});