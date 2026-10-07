import { describe, expect, it } from "vitest";
import { wantsPresentation } from "./presentParam";

describe("wantsPresentation", () => {
  it("accepts 1 and true, with other params around", () => {
    expect(wantsPresentation("?present=1")).toBe(true);
    expect(wantsPresentation("?a=b&present=TRUE")).toBe(true);
  });
  it("rejects everything else", () => {
    for (const s of ["", "?present", "?present=0", "?present=yes", "?other=1"]) {
      expect(wantsPresentation(s)).toBe(false);
    }
  });
});