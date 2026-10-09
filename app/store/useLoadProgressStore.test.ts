import { beforeEach, describe, expect, it } from "vitest";
import { useLoadProgressStore } from "./useLoadProgressStore";

beforeEach(() => useLoadProgressStore.getState().reset());

describe("useLoadProgressStore", () => {
  it("moves reading -> processing -> idle", () => {
    const s = useLoadProgressStore.getState();
    s.begin();
    s.setFraction(0.4);
    expect(useLoadProgressStore.getState()).toMatchObject({ stage: "reading", fraction: 0.4 });
    s.setProcessing();
    expect(useLoadProgressStore.getState().stage).toBe("processing");
    s.reset();
    expect(useLoadProgressStore.getState()).toMatchObject({ stage: "idle", fraction: 0 });
  });

  it("clamps the fraction and ignores late updates", () => {
    const s = useLoadProgressStore.getState();
    s.begin();
    s.setFraction(7);
    expect(useLoadProgressStore.getState().fraction).toBe(1);
    s.setProcessing();
    s.setFraction(0.2); // a read callback that arrives after processing started
    expect(useLoadProgressStore.getState().fraction).toBe(1);
  });
});