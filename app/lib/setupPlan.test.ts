import { describe, expect, it } from "vitest";
import { createScreen } from "./schema";
import { countMissingVideos, describeImport, videoSrcsOf } from "./setupPlan";

const vid = (id: string, src?: string) =>
  createScreen(id, id, { content: { type: "video", ...(src ? { src } : {}), fit: "contain" } });

describe("videoSrcsOf", () => {
  it("returns unique video ids and ignores other screens", () => {
    const screens = [vid("a", "video:1"), vid("b", "video:1"), vid("c", "video:2"), vid("d"), createScreen("e", "e")];
    expect(videoSrcsOf(screens).sort()).toEqual(["video:1", "video:2"]);
  });
});

describe("countMissingVideos", () => {
  it("counts screens whose file is unavailable, not screens with no file chosen", () => {
    const screens = [vid("a", "video:1"), vid("b", "video:2"), vid("c")];
    expect(countMissingVideos(screens, (s) => s === "video:1")).toBe(1);
    expect(countMissingVideos(screens, () => true)).toBe(0);
  });
});

describe("describeImport", () => {
  const setup = { version: 1 as const, screens: [createScreen("a", "A")], model: { name: "a.glb", unit: "m" } };

  it("says what will be replaced", () => {
    const d = describeImport({ setup, skipped: 0, currentScreenCount: 3, currentModelName: "a.glb" });
    expect(d.replaces).toBe("Import 1 screen? This replaces the 3 screens in this scene.");
    expect(d.modelNote).toBeNull();
  });

  it("omits the replace warning for an empty scene and mentions skipped entries", () => {
    const d = describeImport({ setup, skipped: 2, currentScreenCount: 0, currentModelName: null });
    expect(d.replaces).toBe("Import 1 screen (2 entries skipped)?");
  });

  it("warns when the setup was made for a different model", () => {
    const d = describeImport({ setup, skipped: 0, currentScreenCount: 1, currentModelName: "b.glb" });
    expect(d.modelNote).toMatch(/a\.glb/);
    expect(d.modelNote).toMatch(/b\.glb/);
  });
});