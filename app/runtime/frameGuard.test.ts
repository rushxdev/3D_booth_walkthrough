import { describe, expect, it, vi } from "vitest";
import { createFrameGuard } from "./frameGuard";

const make = (threshold = 3) => {
  const onFault = vi.fn();
  const log = vi.fn();
  return { onFault, log, run: createFrameGuard("walk", { threshold, onFault, log }) };
};
const boom = () => {
  throw new Error("boom");
};

describe("createFrameGuard", () => {
  it("passes working code through", () => {
    const { run, onFault, log } = make();
    const fn = vi.fn();
    run(fn);
    run(fn);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(onFault).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it("never throws, and logs once per streak", () => {
    const { run, log } = make(10);
    expect(() => {
      run(boom);
      run(boom);
    }).not.toThrow();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe("[frame:walk]");
  });

  it("reports a fault after the threshold, once, and then stops running the code", () => {
    const { run, onFault } = make(3);
    const fn = vi.fn(boom);
    for (let i = 0; i < 10; i++) run(fn);
    expect(onFault).toHaveBeenCalledTimes(1);
    expect(onFault.mock.calls[0][0]).toBe("walk");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("a success resets the streak, so occasional failures are tolerated", () => {
    const { run, onFault, log } = make(3);
    for (let i = 0; i < 5; i++) {
      run(boom);
      run(boom);
      run(() => {});
    }
    expect(onFault).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(5); // one per streak
  });
});