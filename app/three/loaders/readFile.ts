export type ReadResult =
  | { ok: true; buffer: ArrayBuffer }
  | { ok: false; reason: "cancelled" | "memory" | "read" };

export type ReadOptions = {
  /** Called when the whole-number percentage changes, with a fraction from 0 to 1. */
  onProgress?: (fraction: number) => void;
  shouldCancel?: () => boolean;
};

export function progressFraction(read: number, total: number): number {
  if (!Number.isFinite(read) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.min(1, Math.max(0, read / total));
}

const isMemoryError = (e: unknown) => e instanceof RangeError || (e as { name?: string } | null)?.name === "NotReadableError";

/** Reads a file into one buffer with progress. Never throws. */
export async function readBlob(blob: Blob, options: ReadOptions = {}): Promise<ReadResult> {
  if (typeof blob.stream !== "function") {
    try {
      const buffer = await blob.arrayBuffer();
      options.onProgress?.(1);
      return { ok: true, buffer };
    } catch (e) {
      return { ok: false, reason: isMemoryError(e) ? "memory" : "read" };
    }
  }

  const total = blob.size;
  let target: Uint8Array;
  try {
    target = new Uint8Array(total);
  } catch {
    return { ok: false, reason: "memory" };
  }

  let offset = 0;
  let lastPercent = -1;
  const reader = blob.stream().getReader();
  const stop = () => reader.cancel().catch(() => {});

  try {
    for (;;) {
      if (options.shouldCancel?.()) {
        await stop();
        return { ok: false, reason: "cancelled" };
      }
      const { done, value } = await reader.read();
      if (done) break;
      if (offset + value.byteLength > total) {
        await stop(); // the file grew while it was being read
        return { ok: false, reason: "read" };
      }
      target.set(value, offset);
      offset += value.byteLength;

      const percent = Math.floor(progressFraction(offset, total) * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        options.onProgress?.(percent / 100);
      }
    }
  } catch (e) {
    return { ok: false, reason: isMemoryError(e) ? "memory" : "read" };
  }

  if (offset !== total) return { ok: false, reason: "read" }; // the file shrank
  return { ok: true, buffer: target.buffer as ArrayBuffer };
}