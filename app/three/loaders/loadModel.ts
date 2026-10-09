import type * as THREE from "three";
import { errorIssue } from "./errors";
import type { LoadIssue } from "./errors";
import { getGltfLoader } from "./gltfLoader";
import {
  checkGlbHeader,
  classifyError,
  emptySceneIssue,
  hasGlbMagic,
  inspectGltfJson,
  missingResourcesIssue,
} from "./inspect";
import { getExtension } from "./validate";
import { ModelMeasure } from "./normalize";
import type { Unit } from "./../../lib/units";
import { guessUnit } from "./../../lib/units";
import { largestDimension, measureModel } from "./normalize";
import { readBlob } from "./readFile";

export type LoadResult =
  | { ok: true; scene: THREE.Group; measure: ModelMeasure; unit: Unit }
  | { ok: false; error: LoadIssue };

export type LoadHooks = {
  onProgress?: (fraction: number) => void;
  /** Reading is done; parsing has no progress to report. */
  onProcessing?: () => void;
  shouldCancel?: () => boolean;
};

const fail = (error: LoadIssue): LoadResult => ({ ok: false, error });

const cancelled = () => fail(errorIssue("cancelled", "Loading cancelled", "A newer file was opened."));

function readFailure(reason: "cancelled" | "memory" | "read"): LoadResult {
  if (reason === "cancelled") return cancelled();
  if (reason === "memory") {
    return fail(
      errorIssue(
        "out-of-memory",
        "Not enough memory",
        "The browser ran out of memory reading this file. Close other tabs, or export a smaller model (Draco and KTX2 compression help).",
      ),
    );
  }
  return fail(
    errorIssue(
      "read-failed",
      "Couldn't read the file",
      "The browser could not read this file. It may have been moved, deleted or changed. Select it again.",
    ),
  );
}

/** Never throws: every failure comes back as { ok: false, error }. */
export async function loadModel(file: File, hooks: LoadHooks = {}): Promise<LoadResult> {
  try {
    const read = await readBlob(file, { onProgress: hooks.onProgress, shouldCancel: hooks.shouldCancel });
    if (!read.ok) return readFailure(read.reason);
    const buffer = read.buffer;

    hooks.onProcessing?.();
    await new Promise<void>((resolve) => setTimeout(resolve, 0)); // let "Processing" paint first
    if (hooks.shouldCancel?.()) return cancelled();

    // Decide by content, not by extension.
    let input: ArrayBuffer | string;
    if (hasGlbMagic(buffer)) {
      const issue = checkGlbHeader(buffer);
      if (issue) return fail(issue);
      input = buffer;
    } else if (getExtension(file.name) === "gltf") {
      const text = new TextDecoder().decode(buffer);
      const inspected = inspectGltfJson(text);
      if (!inspected.ok) return fail(inspected.error);
      if (inspected.externalUris.length > 0) return fail(missingResourcesIssue(inspected.externalUris));
      input = text;
    } else {
      return fail(errorIssue("not-gltf", "Not a valid GLB file", "This file doesn't contain glTF data. It may be a different format that was renamed. Export the model as glTF 2.0 and try again."));
    }

    const gltf = await getGltfLoader().parseAsync(input, "");
    const scene = gltf.scene ?? gltf.scenes?.[0];
    if (!scene) return fail(emptySceneIssue());
    const measure = measureModel(scene);
    if (!measure) return fail(emptySceneIssue());
    return { ok: true, scene, measure, unit: guessUnit(largestDimension(measure)) };
  } catch (err) {
    console.error("[loadModel]", err);
    return fail(classifyError(err));
  }
}