import { beforeEach, describe, expect, it } from "vitest";
import { useScreenStore } from "./useScreenStore";
import { createScreen } from "./../lib/schema";

const state = () => useScreenStore.getState();

describe("useScreenStore", () => {
  beforeEach(() => useScreenStore.setState({ screens: [], selectedId: null }));

  it("adds numbered 16:9 screens and selects the newest", () => {
    const a = state().add();
    const b = state().add();
    expect(state().screens.map((s) => s.name)).toEqual(["Screen 1", "Screen 2"]);
    expect(state().selectedId).toBe(b);
    expect(a).not.toBe(b);
    expect([state().screens[0].width, state().screens[0].height]).toEqual([1.6, 0.9]);
  });

  it("sanitizes overrides on add", () => {
    state().add({ width: 999, height: NaN, position: [1, 2, 3] });
    const s = state().screens[0];
    expect([s.width, s.height]).toEqual([50, 0.9]);
    expect(s.position).toEqual([1, 2, 3]);
  });

  it("updates valid fields, ignores invalid ones and unknown ids", () => {
    const id = state().add();
    state().update(id, { name: "Stage left", width: 3.2, height: NaN });
    const s = state().screens[0];
    expect([s.name, s.width, s.height]).toEqual(["Stage left", 3.2, 0.9]);

    const before = state().screens;
    state().update("missing", { width: 5 });
    state().update(id, { name: "   " });
    expect(state().screens).toBe(before); // nothing changed, same reference
  });

  it("makes a locked screen ignore transform, size and content, but not name, visibility or the lock", () => {
    const id = state().add();
    state().update(id, { locked: true });
    state().update(id, { position: [9, 9, 9], rotation: [1, 1, 1], width: 5, height: 5, content: { type: "video", fit: "cover" } });
    let s = state().screens[0];
    expect([s.position, s.width, s.content.type]).toEqual([[0, 1.5, 0], 1.6, "none"]);

    state().update(id, { name: "Pinned", visible: false });
    s = state().screens[0];
    expect([s.name, s.visible]).toEqual(["Pinned", false]);

    state().update(id, { locked: false });
    state().update(id, { width: 5 });
    expect(state().screens[0].width).toBe(5);
  });

  it("removes a screen and clears the selection only if it was selected", () => {
    const a = state().add();
    const b = state().add();
    state().select(a);
    state().remove(b);
    expect(state().selectedId).toBe(a);
    state().remove(a);
    expect(state().selectedId).toBeNull();
    expect(state().screens).toEqual([]);
  });

  it("duplicates beside the original, unlocked, and selects the copy", () => {
    const id = state().add({ position: [0, 1.5, 0] });
    state().update(id, { locked: true });
    const copyId = state().duplicate(id)!;
    const copy = state().screens.find((s) => s.id === copyId)!;
    expect(copy.name).toBe("Screen 1 copy");
    expect(copy.position[0]).toBeCloseTo(0.3, 10);
    expect(copy.locked).toBe(false);
    expect(state().selectedId).toBe(copyId);
    expect(state().duplicate("missing")).toBeNull();
  });

  it("only selects screens that exist", () => {
    const id = state().add();
    state().select("missing");
    expect(state().selectedId).toBe(id);
    state().select(null);
    expect(state().selectedId).toBeNull();
  });
  
  describe("replaceAll", () => {
    it("swaps the list and clears the selection", () => {
      const old = state().add();
      expect(state().selectedId).toBe(old);

      state().replaceAll([createScreen("x", "X"), createScreen("y", "Y")]);
      const s = state();
      expect(s.screens.map((v) => v.id)).toEqual(["x", "y"]);
      expect(s.selectedId).toBeNull();
    });

    it("does not alias the input array", () => {
      const input = [createScreen("x", "X")];
      state().replaceAll(input);
      input.push(createScreen("z", "Z"));
      expect(state().screens).toHaveLength(1);
    });

    it("accepts an empty list", () => {
      state().add();
      state().replaceAll([]);
      expect(state().screens).toEqual([]);
    });
  });
});