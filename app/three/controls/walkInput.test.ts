import { describe, expect, it } from "vitest";
import { createWalkInput, deriveState } from "./walkInput";

const key = (type: string, code: string, extra: object = {}) =>
  Object.assign(new Event(type, { cancelable: true }), { code, ctrlKey: false, metaKey: false, altKey: false, ...extra });

describe("deriveState", () => {
  it("maps keys to actions", () => {
    expect(deriveState(new Set(["KeyW", "ShiftLeft"]))).toEqual({ forward: true, back: false, left: false, right: false, run: true });
  });
  it("stays active while any key of an action is held", () => {
    expect(deriveState(new Set(["ArrowUp"])).forward).toBe(true);
    expect(deriveState(new Set(["KeyW", "ArrowUp"])).forward).toBe(true);
    expect(deriveState(new Set(["KeyW"])).forward).toBe(true);
  });
});

describe("createWalkInput", () => {
  function setup(active = true) {
    const target = new EventTarget();
    const input = createWalkInput();
    const detach = input.attach(target, () => active);
    return { target, input, detach };
  }

  it("tracks presses and releases", () => {
    const { target, input } = setup();
    target.dispatchEvent(key("keydown", "KeyW"));
    expect(input.state.forward).toBe(true);
    target.dispatchEvent(key("keyup", "KeyW"));
    expect(input.state.forward).toBe(false);
  });

  it("ignores keydown when inactive but still clears on keyup", () => {
    const { target, input } = setup(false);
    const e = key("keydown", "KeyW");
    target.dispatchEvent(e);
    expect(input.state.forward).toBe(false);
    expect(e.defaultPrevented).toBe(false);
  });

  it("ignores shortcuts with modifiers and unrelated keys", () => {
    const { target, input } = setup();
    target.dispatchEvent(key("keydown", "KeyW", { ctrlKey: true }));
    target.dispatchEvent(key("keydown", "KeyQ"));
    expect(input.state.forward).toBe(false);
  });

  it("releases everything on window blur and on detach", () => {
    const { target, input, detach } = setup();
    target.dispatchEvent(key("keydown", "KeyW"));
    target.dispatchEvent(new Event("blur"));
    expect(input.state.forward).toBe(false);

    target.dispatchEvent(key("keydown", "KeyD"));
    detach();
    expect(input.state.right).toBe(false);
  });
});