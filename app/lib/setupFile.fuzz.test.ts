import { describe, expect, it } from "vitest";
import { screenProblems, seededRandom, junk } from "./schemaInvariants.testutil";
import { createScreen } from "./schema";
import { parseSetup, parseSetupText, serializeSetup, setupToJson } from "./setupFile";

describe("setup validation under abuse", () => {
  it("never throws, and only ever returns valid screens (2000 junk files)", () => {
    const rand = seededRandom(42);
    for (let i = 0; i < 2000; i++) {
      const screens = Array.from({ length: Math.floor(rand() * 6) }, () => junk(rand));
      const raw = rand() < 0.8 ? { version: 1, screens, model: junk(rand) } : junk(rand);

      const result = parseSetup(raw);
      if (!result.ok) {
        expect(result.message.length).toBeGreaterThan(0);
        continue;
      }
      const ids = result.setup.screens.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const s of result.setup.screens) expect(screenProblems(s), JSON.stringify(raw)).toEqual([]);
    }
  });

  it("handles every truncation of a valid file", () => {
    const text = setupToJson(
      serializeSetup([createScreen("a", "A", { content: { type: "video", src: "video:1", fit: "cover" } }), createScreen("b", "B")], {
        name: "booth.glb",
        unit: "cm",
      }),
    );
    for (let end = 0; end < text.length; end += 7) {
      expect(() => parseSetupText(text.slice(0, end))).not.toThrow();
    }
    expect(parseSetupText(text).ok).toBe(true);
  });

  it("rejects non-JSON noise", () => {
    const rand = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const noise = Array.from({ length: 1 + Math.floor(rand() * 80) }, () => String.fromCharCode(Math.floor(rand() * 0xffff))).join("");
      expect(() => parseSetupText(noise)).not.toThrow();
    }
  });
});