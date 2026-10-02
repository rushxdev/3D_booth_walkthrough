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

export type LoadResult =
  | { ok: true; scene: THREE.Group; measure: ModelMeasure; unit: Unit }
  | { ok: false; error: LoadIssue };

const fail = (error: LoadIssue): LoadResult => ({ ok: false, error });

/** Never throws: every failure comes back as { ok: false, error }. */
export async function loadModel(file: File): Promise<LoadResult> {
  try {
    let buffer: ArrayBuffer;
    try {
      buffer = await file.arrayBuffer();
    } catch {
      return fail(errorIssue("read-failed", "Couldn't read the file", "The browser could not read this file. It may have been moved or deleted. Select it again."));
    }

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