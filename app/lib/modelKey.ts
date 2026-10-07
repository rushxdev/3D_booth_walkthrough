export const SAMPLE_MODEL_KEY = "sample";

/** FNV-1a, 32 bit, over UTF-16 code units. Deterministic and tiny; not a security hash. */
function fnv1a(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/**
 * Storage key for a loaded file: hash of name + size in bytes.
 * Limit: two different files with the same name and size share a setup.
 */
export function modelKeyFor(name: string, sizeBytes: number): string {
  return fnv1a(`${name}\u0000${Math.max(0, Math.floor(sizeBytes))}`);
}