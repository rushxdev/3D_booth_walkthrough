import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addVideoSource,
  getVideoUrl,
  pruneVideoSources,
  videoSourceCount,
  VIDEO_SRC_PREFIX,
  getVideoFile,
  registerVideoSource,
} from "./videoSources";

let counter = 0;
const file = () => ({ name: "a.mp4", size: 10 }) as unknown as File;

beforeEach(() => {
  vi.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:test-${++counter}`);
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});

afterEach(() => {
  pruneVideoSources([]);
  vi.restoreAllMocks();
});

describe("videoSources", () => {
  it("registers a restored file under its old id, once", () => {
    const f = file();
    registerVideoSource("video:restored", f);
    const url = getVideoUrl("video:restored");
    registerVideoSource("video:restored", file()); // no-op
    expect(getVideoUrl("video:restored")).toBe(url);
    expect(getVideoFile("video:restored")).toBe(f);
  });
  
  it("registers a file and resolves its url", () => {
    const id = addVideoSource(file());
    expect(id.startsWith(VIDEO_SRC_PREFIX)).toBe(true);
    expect(getVideoUrl(id)).toMatch(/^blob:test-/);
  });

  it("returns null for unknown or missing ids", () => {
    expect(getVideoUrl("video:nope")).toBeNull();
    expect(getVideoUrl(undefined)).toBeNull();
  });

  it("prunes only unreferenced sources and revokes their urls", () => {
    const a = addVideoSource(file());
    const b = addVideoSource(file());
    const urlB = getVideoUrl(b);

    expect(pruneVideoSources([a, undefined])).toBe(1);
    expect(getVideoUrl(a)).not.toBeNull();
    expect(getVideoUrl(b)).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(urlB);
    expect(videoSourceCount()).toBe(1);
  });
});