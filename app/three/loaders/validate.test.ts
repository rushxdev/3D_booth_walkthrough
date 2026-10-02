import { describe, expect, it } from "vitest";
import { LARGE_FILE_BYTES, getExtension, validateModelFile } from "./validate";

const f = (name: string, size = 1000) => ({ name, size });

describe("getExtension", () => {
  it("lowercases and handles missing extensions", () => {
    expect(getExtension("Booth.GLB")).toBe("glb");
    expect(getExtension("model")).toBe("");
    expect(getExtension("a.b.gltf")).toBe("gltf");
  });
});

describe("validateModelFile", () => {
  it("accepts .glb and .gltf in any case", () => {
    expect(validateModelFile(f("a.glb")).ok).toBe(true);
    expect(validateModelFile(f("A.GLTF")).ok).toBe(true);
  });

  it("rejects other types, no extension, and double extensions", () => {
    for (const name of ["notes.txt", "model", "model.glb.txt", "x.fbx"]) {
      const r = validateModelFile(f(name));
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("unsupported-type");
    }
  });

  it("rejects empty files", () => {
    const r = validateModelFile(f("a.glb", 0));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("empty-file");
  });

  it("reports the type error before the empty error", () => {
    const r = validateModelFile(f("a.txt", 0));
    if (!r.ok) expect(r.error.code).toBe("unsupported-type");
  });

  it("warns above the size threshold, not at it", () => {
    const over = validateModelFile(f("a.glb", LARGE_FILE_BYTES + 1));
    expect(over.ok && over.warning?.code).toBe("large-file");
    const at = validateModelFile(f("a.glb", LARGE_FILE_BYTES));
    expect(at.ok && at.warning).toBeUndefined();
  });
});