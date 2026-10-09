import { beforeEach, describe, expect, it } from "vitest";
import { useFaultStore } from "./useFaultStore";

beforeEach(() => useFaultStore.getState().clear());

describe("useFaultStore", () => {
  it("keeps the first fault", () => {
    const { report } = useFaultStore.getState();
    report("walk", new Error("a"));
    report("overview", new Error("b"));
    expect(useFaultStore.getState().fault?.source).toBe("walk");
  });

  it("clear lets a new fault in", () => {
    const { report, clear } = useFaultStore.getState();
    report("walk", "x");
    clear();
    expect(useFaultStore.getState().fault).toBeNull();
    report("overview", "y");
    expect(useFaultStore.getState().fault?.source).toBe("overview");
  });
});