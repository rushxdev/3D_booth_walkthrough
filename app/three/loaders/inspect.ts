import * as THREE from "three";
import { errorIssue } from "./errors";
import type { LoadIssue } from "./errors";

const GLB_MAGIC = 0x46546c67; // "glTF", little-endian
const GLB_HEADER_BYTES = 12;

export function hasGlbMagic(buf: ArrayBuffer): boolean {
  return buf.byteLength >= GLB_HEADER_BYTES && new DataView(buf).getUint32(0, true) === GLB_MAGIC;
}

/** Checks a buffer that already passed hasGlbMagic. Returns an issue, or null if fine. */
export function checkGlbHeader(buf: ArrayBuffer): LoadIssue | null {
  const view = new DataView(buf);
  const version = view.getUint32(4, true);
  const declaredLength = view.getUint32(8, true);
  if (version !== 2) {
    return errorIssue(
      "unsupported-version",
      "Unsupported glTF version",
      `This file is glTF ${version}. Only glTF 2.0 is supported. Re-export it as glTF 2.0.`,
    );
  }
  if (declaredLength > buf.byteLength) {
    return errorIssue(
      "corrupt-file",
      "File is incomplete",
      "The file ends before its declared length, so it was probably cut off during export or download. Export or download it again.",
    );
  }
  return null;
}

export type GltfInspection =
  | { ok: true; externalUris: string[] }
  | { ok: false; error: LoadIssue };

/** Light pre-parse of a .gltf text file: is it glTF 2.x, and which files does it reference? */
export function inspectGltfJson(text: string): GltfInspection {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return {
      ok: false,
      error: errorIssue("not-gltf", "Not a valid glTF file", "This file is not valid glTF JSON. It may be a different format that was renamed. Export the model as glTF 2.0 and try again."),
    };
  }

  const doc = json as { asset?: { version?: unknown }; buffers?: unknown; images?: unknown } | null;
  if (!doc || typeof doc !== "object" || !doc.asset) {
    return {
      ok: false,
      error: errorIssue("not-gltf", "Not a valid glTF file", "This JSON file has no glTF asset header. Export the model as glTF 2.0 and try again."),
    };
  }

  const version = String(doc.asset.version ?? "");
  if (!version.startsWith("2")) {
    return {
      ok: false,
      error: errorIssue("unsupported-version", "Unsupported glTF version", `This file is glTF ${version || "of unknown version"}. Only glTF 2.0 is supported. Re-export it as glTF 2.0.`),
    };
  }

  const uris = new Set<string>();
  for (const list of [doc.buffers, doc.images]) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const uri = (item as { uri?: unknown } | null)?.uri;
      if (typeof uri === "string" && !uri.startsWith("data:")) uris.add(uri);
    }
  }
  return { ok: true, externalUris: [...uris] };
}

export function missingResourcesIssue(uris: string[]): LoadIssue {
  const shown = uris.slice(0, 3).map((u) => `"${u}"`).join(", ");
  const extra = uris.length > 3 ? ` and ${uris.length - 3} more` : "";
  return errorIssue(
    "missing-resources",
    "Missing external files",
    `This .gltf refers to separate files (${shown}${extra}). Export the model as a single .glb, which embeds everything.`,
  );
}

export function emptySceneIssue(): LoadIssue {
  return errorIssue(
    "empty-scene",
    "Nothing to show",
    "The file loaded but contains no meshes. Check that the export includes geometry and not only cameras, lights or empties.",
  );
}

export function countMeshes(root: THREE.Object3D): number {
  let n = 0;
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) n += 1;
  });
  return n;
}

// Only real allocation failures. A RangeError from a DataView read is a corrupt file, not low memory.
const OOM_PATTERN = /allocation failed|out of memory|invalid array buffer length|invalid typed array length|invalid string length/i;

export function classifyError(err: unknown): LoadIssue {
  const msg = err instanceof Error ? err.message : String(err);
  if (OOM_PATTERN.test(msg)) {
    return errorIssue(
      "out-of-memory",
      "Not enough memory",
      "The browser ran out of memory loading this model. Close other tabs, or reduce the model (fewer triangles, smaller textures, Draco/KTX2 compression) and retry.",
    );
  }
  const detail = msg.length > 160 ? `${msg.slice(0, 160)}...` : msg;
  return errorIssue(
    "corrupt-file",
    "Couldn't read this model",
    `The file may be corrupt or use features this viewer doesn't support. Try exporting it again as glTF 2.0.${detail ? ` Details: ${detail}` : ""}`,
  );
}