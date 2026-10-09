import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { watchContext } from "./contextWatch";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const setup = () => {
  const target = new EventTarget();
  const h = { onLost: vi.fn(), onRestored: vi.fn(), onTimeout: vi.fn() };
  const stop = watchContext(target, h, 1000);
  return { target, h, stop };
};
const fire = (t: EventTarget, type: string) => {
  const e = new Event(type, { cancelable: true });
  t.dispatchEvent(e);
  return e;
};

describe("watchContext", () => {
  it("prevents the default so the browser can restore, and reports the loss", () => {
    const { target, h } = setup();
    expect(fire(target, "webglcontextlost").defaultPrevented).toBe(true);
    expect(h.onLost).toHaveBeenCalledTimes(1);
  });

  it("times out when the context does not come back", () => {
    const { target, h } = setup();
    fire(target, "webglcontextlost");
    vi.advanceTimersByTime(1000);
    expect(h.onTimeout).toHaveBeenCalledTimes(1);
  });

  it("a restore cancels the timeout", () => {
    const { target, h } = setup();
    fire(target, "webglcontextlost");
    vi.advanceTimersByTime(500);
    fire(target, "webglcontextrestored");
    vi.advanceTimersByTime(5000);
    expect(h.onRestored).toHaveBeenCalledTimes(1);
    expect(h.onTimeout).not.toHaveBeenCalled();
  });

  it("cleanup removes the listeners and the pending timeout", () => {
    const { target, h, stop } = setup();
    fire(target, "webglcontextlost");
    stop();
    vi.advanceTimersByTime(5000);
    fire(target, "webglcontextlost");
    expect(h.onLost).toHaveBeenCalledTimes(1);
    expect(h.onTimeout).not.toHaveBeenCalled();
  });
});