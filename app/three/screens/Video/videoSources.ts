import { newId } from "./../../../lib/id";

/** Prefix of every video id stored in `content.src`. */
export const VIDEO_SRC_PREFIX = "video:";

type Entry = { file: File; url: string };
const entries = new Map<string, Entry>();

/** Registers a picked file and returns the id to store in `content.src`. */
export function addVideoSource(file: File): string {
  const id = VIDEO_SRC_PREFIX + newId();
  entries.set(id, { file, url: URL.createObjectURL(file) });
  return id;
}

export function getVideoUrl(src: string | undefined): string | null {
  return (src && entries.get(src)?.url) || null;
}

export function getVideoFile(src: string | undefined): File | null {
  return (src && entries.get(src)?.file) || null;
}

/**
 * Releases every source that no screen references any more.
 * Call this from a store subscription, never from a React effect cleanup
 * (Strict Mode runs cleanup between two setups).
 */
export function pruneVideoSources(inUse: Iterable<string | undefined>): number {
  const keep = new Set(inUse);
  let released = 0;
  for (const [id, entry] of entries) {
    if (!keep.has(id)) {
      URL.revokeObjectURL(entry.url);
      entries.delete(id);
      released++;
    }
  }
  return released;
}

export function videoSourceCount(): number {
  return entries.size;
}