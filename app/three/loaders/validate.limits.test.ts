import { describe, expect, it } from "vitest";
import { LARGE_FILE_BYTES, MAX_FILE_BYTES, MAX_GLTF_JSON_BYTES, validateModelFile } from "./validate";

const MB = 1024 * 1024;

describe("size limits", () => {
  it("accepts a file at the hard limit and refuses one byte over", () => {
    expect(validateModelFile({ name: "a.glb", size: MAX_FILE_BYTES }).ok).toBe(true);
    const r = validateModelFile({ name: "a.glb", size: MAX_FILE_BYTES + 1 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("too-large");
      expect(r.error.message).toMatch(/Draco/);
    }
  });

  it("still warns, but accepts, between the warning and the hard limit", () => {
    const r = validateModelFile({ name: "a.glb", size: LARGE_FILE_BYTES + MB });
    expect(r.ok && r.warning?.code).toBe("large-file");
  });

  it("has a lower limit for .gltf text and tells the user to use .glb", () => {
    expect(validateModelFile({ name: "a.gltf", size: MAX_GLTF_JSON_BYTES }).ok).toBe(true);
    const r = validateModelFile({ name: "A.GLTF", size: MAX_GLTF_JSON_BYTES + 1 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("too-large");
      expect(r.error.message).toMatch(/\.glb/);
    }
  });

  it("keeps the earlier checks first", () => {
    const r = validateModelFile({ name: "a.txt", size: MAX_FILE_BYTES * 2 });
    expect(!r.ok && r.error.code).toBe("unsupported-type");
    const empty = validateModelFile({ name: "a.glb", size: 0 });
    expect(!empty.ok && empty.error.code).toBe("empty-file");
  });

  it("keeps the limits ordered", () => {
    expect(LARGE_FILE_BYTES).toBeLessThan(MAX_GLTF_JSON_BYTES);
    expect(MAX_GLTF_JSON_BYTES).toBeLessThan(MAX_FILE_BYTES);
  });
});