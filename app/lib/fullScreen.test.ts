import { describe, expect, it, vi } from "vitest";
import { enterFullscreen, exitFullscreen, fullscreenSupported } from "./fullscreen";

const doc = (over: Record<string, unknown> = {}) =>
  ({
    fullscreenEnabled: true,
    fullscreenElement: null,
    exitFullscreen: vi.fn(async () => {}),
    documentElement: { requestFullscreen: vi.fn(async () => {}) },
    ...over,
  }) as never;

describe("enterFullscreen", () => {
  it("requests fullscreen when supported", async () => {
    const d = doc();
    expect(await enterFullscreen(d)).toEqual({ ok: true });
    expect((d as any).documentElement.requestFullscreen).toHaveBeenCalled();
  });

  it("reports unsupported browsers and a missing document", async () => {
    expect(await enterFullscreen(doc({ fullscreenEnabled: false }))).toEqual({ ok: false, reason: "unsupported" });
    expect(await enterFullscreen(doc({ documentElement: {} }))).toEqual({ ok: false, reason: "unsupported" });
    expect(await enterFullscreen(null)).toEqual({ ok: false, reason: "unsupported" });
  });

  it("turns a denial into a result instead of throwing", async () => {
    const d = doc({ documentElement: { requestFullscreen: vi.fn(async () => { throw new TypeError("denied"); }) } });
    expect(await enterFullscreen(d)).toEqual({ ok: false, reason: "denied" });
  });

  it("does nothing when already fullscreen", async () => {
    const d = doc({ fullscreenElement: {} });
    expect(await enterFullscreen(d)).toEqual({ ok: true });
    expect((d as any).documentElement.requestFullscreen).not.toHaveBeenCalled();
  });
});

describe("exitFullscreen", () => {
  it("exits only when fullscreen is active", async () => {
    const idle = doc();
    await exitFullscreen(idle);
    expect((idle as any).exitFullscreen).not.toHaveBeenCalled();

    const active = doc({ fullscreenElement: {} });
    expect(await exitFullscreen(active)).toEqual({ ok: true });
    expect((active as any).exitFullscreen).toHaveBeenCalled();
  });

  it("swallows a failing exit", async () => {
    const d = doc({ fullscreenElement: {}, exitFullscreen: vi.fn(async () => { throw new Error("x"); }) });
    expect(await exitFullscreen(d)).toEqual({ ok: false, reason: "denied" });
  });
});

describe("fullscreenSupported", () => {
  it("is false without a document", () => expect(fullscreenSupported(null)).toBe(false));
});