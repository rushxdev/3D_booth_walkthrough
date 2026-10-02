import { formatBytes } from "./../../lib/format";
import type { LoadIssue } from "./errors";

export const ALLOWED_EXTENSIONS = ["glb", "gltf"] as const;
export const LARGE_FILE_BYTES = 150 * 1024 * 1024;

export function getExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

export function isAllowedExtension(name: string): boolean {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(getExtension(name));
}

export type ValidationResult =
  | { ok: true; warning?: LoadIssue }
  | { ok: false; error: LoadIssue };

export function validateModelFile(file: { name: string; size: number }): ValidationResult {
  if (!isAllowedExtension(file.name)) {
    return {
      ok: false,
      error: {
        severity: "error",
        code: "unsupported-type",
        title: "Unsupported file type",
        message: `"${file.name}" is not a .glb or .gltf file. Export the model as glTF 2.0 from your 3D tool (in Blender: File > Export > glTF 2.0) and open that instead.`,
      },
    };
  }

  if (file.size === 0) {
    return {
      ok: false,
      error: {
        severity: "error",
        code: "empty-file",
        title: "File is empty",
        message: `"${file.name}" is 0 bytes. The export may have failed. Export the model again and retry.`,
      },
    };
  }

  if (file.size > LARGE_FILE_BYTES) {
    return {
      ok: true,
      warning: {
        severity: "warning",
        code: "large-file",
        title: `Large file (${formatBytes(file.size)})`,
        message: "Loading may be slow and use a lot of memory. Compressing geometry (Draco) and textures (KTX2) in the export helps.",
      },
    };
  }

  return { ok: true };
}