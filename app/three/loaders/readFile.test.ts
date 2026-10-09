import { describe, expect, it, vi } from "vitest";
import { progressFraction, readBlob } from "./readFile";

function fakeBlob(chunks: Uint8Array[], failAfter?: number): Blob {
  const size = chunks.reduce((n, c) => n + c.byteLength, 0);
  return {
    size,
    stream: () => {
      let i = 0;
      return new ReadableStream<Uint8Array>({
        pull(controller) {
          if (failAfter !== undefined && i >= failAfter) return controller.error(new Error("disk"));
          if (i >= chunks.length) return controller.close();
          controller.enqueue(chunks[i++]);
        },
      });
    },
  } as unknown as Blob;
}
const bytes = (...n: number[]) => new Uint8Array(n);

describe("progressFraction", () => {
  it("clamps and survives bad input", () => {
    expect(progressFraction(5, 10)).toBe(0.5);
    expect(progressFraction(20, 10)).toBe(1);
    expect(progressFraction(-1, 10)).toBe(0);
    expect(progressFraction(1, 0)).toBe(0);
    expect(progressFraction(NaN, 10)).toBe(0);
  });
});

describe("readBlob", () => {
  it("joins chunks in order", async () => {
    const r = await readBlob(fakeBlob([bytes(1, 2), bytes(3), bytes(4, 5)]));
    expect(r.ok && Array.from(new Uint8Array(r.buffer))).toEqual([1, 2, 3, 4, 5]);
  });

  it("reports increasing progress that ends at 1, once per percent", async () => {
    const onProgress = vi.fn();
    const chunk = new Uint8Array(1000);
    await readBlob(fakeBlob(Array.from({ length: 10 }, () => chunk)), { onProgress });
    const values = onProgress.mock.calls.map((c) => c[0] as number);
    expect(values.at(-1)).toBe(1);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
    expect(new Set(values).size).toBe(values.length);
  });

  it("stops reading when cancelled", async () => {
    let calls = 0;
    const r = await readBlob(fakeBlob([bytes(1), bytes(2), bytes(3), bytes(4)]), {
      shouldCancel: () => ++calls > 2,
    });
    expect(r).toEqual({ ok: false, reason: "cancelled" });
  });

  it("reports a failing stream as a read error", async () => {
    expect(await readBlob(fakeBlob([bytes(1, 2), bytes(3)], 1))).toEqual({ ok: false, reason: "read" });
  });

  it("detects a file that changed size while reading", async () => {
    const blob = fakeBlob([bytes(1, 2, 3)]);
    (blob as { size: number }).size = 2; // grew after the size was taken
    expect(await readBlob(blob)).toEqual({ ok: false, reason: "read" });
    const shrunk = fakeBlob([bytes(1)]);
    (shrunk as { size: number }).size = 5;
    expect(await readBlob(shrunk)).toEqual({ ok: false, reason: "read" });
  });

  it("falls back to arrayBuffer when streams are missing", async () => {
    const onProgress = vi.fn();
    const blob = { size: 3, arrayBuffer: async () => bytes(1, 2, 3).buffer } as unknown as Blob;
    const r = await readBlob(blob, { onProgress });
    expect(r.ok).toBe(true);
    expect(onProgress).toHaveBeenCalledWith(1);
  });

  it("handles an empty blob", async () => {
    const r = await readBlob(fakeBlob([]));
    expect(r.ok && r.buffer.byteLength).toBe(0);
  });
});