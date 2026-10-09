import { describe, expect, it } from "vitest";
import { spokenValue, unitWord } from "./a11y";

describe("unitWord", () => {
  it("spells out known units and passes unknown ones through", () => {
    expect(unitWord("m")).toBe("meters");
    expect(unitWord("°")).toBe("degrees");
    expect(unitWord("px")).toBe("pixels");
    expect(unitWord("furlong")).toBe("furlong");
    expect(unitWord(undefined)).toBe("");
  });
});

describe("spokenValue", () => {
  it("joins the number and the unit word", () => {
    expect(spokenValue(1.6, 2, "m")).toMatch(/^1\.6\d* meters$/);
    expect(spokenValue(90, 0, "°")).toMatch(/^90 degrees$/);
  });
  it("works without a unit and rejects non-numbers", () => {
    expect(spokenValue(3, 0)).toBe("3");
    expect(spokenValue(NaN, 2, "m")).toBeUndefined();
    expect(spokenValue(Infinity, 2, "m")).toBeUndefined();
  });
});