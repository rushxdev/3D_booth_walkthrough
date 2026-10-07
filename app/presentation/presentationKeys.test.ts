import { describe, expect, it } from "vitest";
import { presentationKeyAction } from "./presentationKeys";

const key = (code: string, over = {}) => ({ code, ctrlKey: false, metaKey: false, altKey: false, ...over });
const ctx = (presenting: boolean, hasModel = true) => ({ presenting, hasModel });

describe("presentationKeyAction", () => {
  it("P toggles when a model is loaded, and never without one", () => {
    expect(presentationKeyAction(key("KeyP"), ctx(false))).toBe("toggle-presentation");
    expect(presentationKeyAction(key("KeyP"), ctx(true))).toBe("toggle-presentation");
    expect(presentationKeyAction(key("KeyP"), ctx(false, false))).toBeNull();
  });
  it("V switches view only while presenting", () => {
    expect(presentationKeyAction(key("KeyV"), ctx(true))).toBe("toggle-view");
    expect(presentationKeyAction(key("KeyV"), ctx(false))).toBeNull();
  });
  it("ignores modifiers and key repeat", () => {
    for (const over of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { repeat: true }]) {
      expect(presentationKeyAction(key("KeyP", over), ctx(false))).toBeNull();
    }
  });
  it("ignores other keys", () => {
    expect(presentationKeyAction(key("KeyW"), ctx(true))).toBeNull();
  });
});