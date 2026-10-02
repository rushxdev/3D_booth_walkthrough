import { describe, expect, it } from "vitest";
import { checkGlbHeader, classifyError, hasGlbMagic, inspectGltfJson } from "./inspect";

function glb(version = 2, declared = 12, actual = 12): ArrayBuffer {
  const buf = new ArrayBuffer(actual);
  const v = new DataView(buf);
  v.setUint32(0, 0x46546c67, true);
  v.setUint32(4, version, true);
  v.setUint32(8, declared, true);
  return buf;
}
const text = (s: string) => new TextEncoder().encode(s).buffer as ArrayBuffer;

describe("GLB header", () => {
  it("detects magic bytes", () => {
    expect(hasGlbMagic(glb())).toBe(true);
    expect(hasGlbMagic(text("hello world, not a model"))).toBe(false);
    expect(hasGlbMagic(new ArrayBuffer(4))).toBe(false);
  });
  it("accepts version 2 with a consistent length", () => {
    expect(checkGlbHeader(glb(2, 12, 12))).toBeNull();
  });
  it("rejects other versions and truncated files", () => {
    expect(checkGlbHeader(glb(1))?.code).toBe("unsupported-version");
    expect(checkGlbHeader(glb(2, 5000, 12))?.code).toBe("corrupt-file");
  });
});

describe("inspectGltfJson", () => {
  const doc = (extra: object, version = "2.0") => JSON.stringify({ asset: { version }, ...extra });

  it("rejects non-JSON and JSON without an asset header", () => {
    for (const s of ["hello", "{}", "[]", "null"]) {
      const r = inspectGltfJson(s);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.code).toBe("not-gltf");
    }
  });
  it("rejects glTF 1.x", () => {
    const r = inspectGltfJson(doc({}, "1.0"));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("unsupported-version");
  });
  it("ignores embedded data URIs and lists external files once", () => {
    const r = inspectGltfJson(
      doc({
        buffers: [{ uri: "model.bin" }, { uri: "data:application/octet-stream;base64,AAAA" }],
        images: [{ uri: "tex.png" }, { uri: "tex.png" }, { bufferView: 3 }],
      }),
    );
    expect(r).toEqual({ ok: true, externalUris: ["model.bin", "tex.png"] });
  });
  it("passes a self-contained file", () => {
    expect(inspectGltfJson(doc({}))).toEqual({ ok: true, externalUris: [] });
  });
});

describe("classifyError", () => {
  it("maps real allocation failures to out-of-memory", () => {
    expect(classifyError(new RangeError("Array buffer allocation failed")).code).toBe("out-of-memory");
  });
  it("treats DataView bounds errors as a corrupt file", () => {
    expect(classifyError(new RangeError("Offset is outside the bounds of the DataView")).code).toBe("corrupt-file");
  });
  it("falls back to corrupt-file for anything else", () => {
    expect(classifyError("boom").code).toBe("corrupt-file");
  });
});