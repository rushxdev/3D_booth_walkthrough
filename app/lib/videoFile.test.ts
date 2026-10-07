import { describe, expect, it } from "vitest";
import { checkVideoFile, describeMediaError, LARGE_VIDEO_BYTES } from "./videoFile";

const f = (name: string, size = 1000, type = "") => ({ name, size, type });

describe("checkVideoFile", () => {
  it("accepts mp4, m4v and webm by extension, case-insensitively", () => {
    for (const name of ["a.mp4", "a.M4V", "clip.WebM"]) {
      expect(checkVideoFile(f(name)).ok).toBe(true);
    }
  });

  it("accepts a known mime type when the extension is missing", () => {
    expect(checkVideoFile(f("movie", 10, "video/mp4")).ok).toBe(true);
  });

  it("rejects empty files", () => {
    const r = checkVideoFile(f("a.mp4", 0));
    expect(r.ok).toBe(false);
  });

  it("suggests re-exporting other video formats", () => {
    const r = checkVideoFile(f("a.mov", 10, "video/quicktime"));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/H\.264/);
  });

  it("rejects non-video files", () => {
    const r = checkVideoFile(f("notes.txt", 10, "text/plain"));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/isn't a video/);
  });

  it("warns, but still accepts, huge files", () => {
    const r = checkVideoFile(f("a.mp4", LARGE_VIDEO_BYTES + 1));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.warning).not.toBeNull();
    const small = checkVideoFile(f("a.mp4", 10));
    if (small.ok) expect(small.warning).toBeNull();
  });
});

describe("describeMediaError", () => {
  it("explains unsupported codecs with the H.264 hint", () => {
    expect(describeMediaError(4)).toMatch(/H\.264/);
  });
  it("has a message for every code and for unknown", () => {
    for (const c of [1, 2, 3, 4, undefined, 99]) {
      expect(describeMediaError(c).length).toBeGreaterThan(5);
    }
  });
});