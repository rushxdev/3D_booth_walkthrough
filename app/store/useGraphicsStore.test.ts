import { beforeEach, describe, expect, it } from "vitest";
import { useGraphicsStore } from "./useGraphicsStore";

beforeEach(() => useGraphicsStore.getState().reset());

describe("useGraphicsStore", () => {
  it("goes ok -> lost -> stuck, and a late restore still recovers", () => {
    const s = useGraphicsStore.getState();
    s.markLost();
    s.markStuck();
    expect(useGraphicsStore.getState().status).toBe("stuck");
    s.markRestored();
    expect(useGraphicsStore.getState().status).toBe("ok");
  });

  it("markStuck does nothing unless the context is lost", () => {
    useGraphicsStore.getState().markStuck();
    expect(useGraphicsStore.getState().status).toBe("ok");
  });
});