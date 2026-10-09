import { describe, expect, it, vi } from "vitest";
import { enterFullscreen, exitFullscreen, fullscreenSupported } from "./fullscreen";

type Doc = Parameters<typeof enterFullscreen>[0];

function makeDoc(over: Record<string, unknown> = {}) {
  const request = vi.fn(async () => {});
  const exit = vi.fn(async () => {});
  const doc = {
    fullscreenEnabled: true,
    fullscreenElement: null,
    exitFullscreen: exit,
    documentElement: { requestFullscreen: request },
    ...over,
  } as unknown as Doc;
  return { doc, request, exit };
}

describe("enterFullscreen", () => {
  it("requests fullscreen when supported", async () => {
    const { doc, request } = makeDoc();
    expect(await enterFullscreen(doc)).toEqual({ ok: true });
    expect(request).toHaveBeenCalled();
  });

  it("reports unsupported browsers and a missing document", async () => {
    expect(await enterFullscreen(makeDoc({ fullscreenEnabled: false }).doc)).toEqual({ ok: false, reason: "unsupported" });
    expect(await enterFullscreen(makeDoc({ documentElement: {} }).doc)).toEqual({ ok: false, reason: "unsupported" });
    expect(await enterFullscreen(null)).toEqual({ ok: false, reason: "unsupported" });
  });

  it("turns a denial into a result instead of throwing", async () => {
    const denied = makeDoc({
      documentElement: { requestFullscreen: vi.fn(async () => { throw new TypeError("denied"); }) },
    });
    expect(await enterFullscreen(denied.doc)).toEqual({ ok: false, reason: "denied" });
  });

  it("does nothing when already fullscreen", async () => {
    const { doc, request } = makeDoc({ fullscreenElement: {} });
    expect(await enterFullscreen(doc)).toEqual({ ok: true });
    expect(request).not.toHaveBeenCalled();
  });
});

describe("exitFullscreen", () => {
  it("exits only when fullscreen is active", async () => {
    const idle = makeDoc();
    await exitFullscreen(idle.doc);
    expect(idle.exit).not.toHaveBeenCalled();

    const active = makeDoc({ fullscreenElement: {} });
    expect(await exitFullscreen(active.doc)).toEqual({ ok: true });
    expect(active.exit).toHaveBeenCalled();
  });

  it("swallows a failing exit", async () => {
    const d = makeDoc({ fullscreenElement: {}, exitFullscreen: vi.fn(async () => { throw new Error("x"); }) });
    expect(await exitFullscreen(d.doc)).toEqual({ ok: false, reason: "denied" });
  });
});

describe("fullscreenSupported", () => {
  it("is false without a document", () => expect(fullscreenSupported(null)).toBe(false));
});