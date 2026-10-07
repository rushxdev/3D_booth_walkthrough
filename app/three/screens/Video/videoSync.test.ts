import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createScreen } from "./../../../lib/schema";
import { useScreenStore } from "./../../../store/useScreenStore";
import { addVideoSource, getVideoUrl, pruneVideoSources } from "./videoSources";
import { startVideoSourceSync } from "./videoSync";

let n = 0;
const file = () => ({ name: "a.mp4", size: 10 }) as unknown as File;
const withVideo = (id: string, src: string) =>
  createScreen(id, id, { content: { type: "video", src, fit: "contain" } });

beforeEach(() => {
  vi.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:sync-${++n}`);
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});
afterEach(() => {
  pruneVideoSources([]);
  useScreenStore.setState({ screens: [], selectedId: null });
  vi.restoreAllMocks();
});

describe("startVideoSourceSync", () => {
  it("keeps referenced sources and frees them when the screen goes away", () => {
    const id = addVideoSource(file());
    useScreenStore.setState({ screens: [withVideo("a", id)], selectedId: null });
    const stop = startVideoSourceSync();
    expect(getVideoUrl(id)).not.toBeNull();

    useScreenStore.setState({ screens: [] });
    expect(getVideoUrl(id)).toBeNull();
    stop();
  });

  it("a shared source survives until the last screen using it is gone", () => {
    const id = addVideoSource(file());
    useScreenStore.setState({
      screens: [withVideo("a", id), withVideo("b", id)],
      selectedId: null,
    });
    const stop = startVideoSourceSync();

    useScreenStore.setState({ screens: [withVideo("b", id)] });
    expect(getVideoUrl(id)).not.toBeNull();
    useScreenStore.setState({ screens: [] });
    expect(getVideoUrl(id)).toBeNull();
    stop();
  });
});