import { describe, expect, it } from "vitest";
import { isHelpKey, shortcutGroups } from "./shortcutList";

const flat = (ctx: Parameters<typeof shortcutGroups>[0]) => shortcutGroups(ctx).flatMap((g) => g.items);
const firstKeys = (ctx: Parameters<typeof shortcutGroups>[0]) => flat(ctx).map((i) => i.keys[0]);

describe("shortcutGroups", () => {
  const contexts = [
    { mode: "overview", presenting: false },
    { mode: "walk", presenting: false },
    { mode: "overview", presenting: true },
    { mode: "walk", presenting: true },
  ] as const;

  it("never has empty groups, empty text or duplicate keys inside a group", () => {
    for (const ctx of contexts) {
      for (const g of shortcutGroups(ctx)) {
        expect(g.title.length).toBeGreaterThan(0);
        expect(g.items.length).toBeGreaterThan(0);
        const ids = g.items.map((i) => i.keys.join("+"));
        expect(new Set(ids).size, `${g.title} in ${JSON.stringify(ctx)}`).toBe(ids.length);
        for (const i of g.items) {
          expect(i.action.length).toBeGreaterThan(0);
          expect(i.keys.every((k) => k.length > 0)).toBe(true);
        }
      }
    }
  });

  it("presenting lists no editing keys, but keeps the client keys", () => {
    for (const mode of ["overview", "walk"] as const) {
      const keys = firstKeys({ mode, presenting: true });
      for (const editing of ["E", "Delete", "F2", "Enter", "Ctrl or Cmd"]) expect(keys).not.toContain(editing);
      expect(keys).toContain("P");
      expect(keys).toContain("V");
    }
    expect(firstKeys({ mode: "overview", presenting: true })).not.toContain("W");
    expect(firstKeys({ mode: "overview", presenting: true })).toContain("F");
  });

  it("Walk uses W as movement and lists no editing keys", () => {
    const walk = flat({ mode: "walk", presenting: false });
    expect(walk.find((i) => i.action === "Move")?.keys).toEqual(["W", "A", "S", "D"]);
    expect(walk.some((i) => i.action === "Move tool")).toBe(false);
    expect(firstKeys({ mode: "walk", presenting: false })).not.toContain("Delete");
    expect(firstKeys({ mode: "walk", presenting: false })).toContain("R");
  });

  it("Overview editing lists every editing shortcut", () => {
    const actions = flat({ mode: "overview", presenting: false }).map((i) => i.action);
    for (const a of ["Move tool", "Rotate tool", "Place on surface", "Delete screen", "Duplicate screen"]) {
      expect(actions).toContain(a);
    }
  });

  it("always mentions the help key", () => {
    for (const ctx of contexts) expect(firstKeys(ctx)).toContain("?");
  });
});

describe("isHelpKey", () => {
  const e = (key: string, over = {}) => ({ key, ctrlKey: false, metaKey: false, altKey: false, ...over });
  it("accepts ? and rejects modifiers and other keys", () => {
    expect(isHelpKey(e("?"))).toBe(true);
    expect(isHelpKey(e("?", { ctrlKey: true }))).toBe(false);
    expect(isHelpKey(e("?", { metaKey: true }))).toBe(false);
    expect(isHelpKey(e("?", { altKey: true }))).toBe(false);
    expect(isHelpKey(e("/"))).toBe(false);
  });
});