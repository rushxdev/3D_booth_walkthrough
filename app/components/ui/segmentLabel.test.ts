import { describe, expect, it } from "vitest";
import { segmentHint, segmentTooltip } from "./segmentLabel";

describe("segmentLabel", () => {
  it("explains a disabled option that has a hint", () => {
    const o = { label: "Walk", disabled: true, hint: "Load a model first" };
    expect(segmentHint(o)).toBe("Load a model first");
    expect(segmentTooltip(o)).toBe("Walk: Load a model first");
  });

  it("stays plain when enabled, or when there is nothing to say", () => {
    expect(segmentHint({ label: "Walk", hint: "Load a model first" })).toBeUndefined();
    expect(segmentTooltip({ label: "Walk", hint: "x" })).toBe("Walk");
    expect(segmentTooltip({ label: "Walk", disabled: true })).toBe("Walk");
  });
});