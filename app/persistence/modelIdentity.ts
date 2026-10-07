import { modelKeyFor, SAMPLE_MODEL_KEY } from "./../lib/modelKey";
import type { ModelSource } from "./../store/useSceneStore";

export type ModelIdentity = { key: string; name: string; unit: string };

/** Who the current model is, for storage keys and setup files. Null when nothing is loaded. */
export function modelIdentity(model: ModelSource | null): ModelIdentity | null {
  if (!model) return null;
  if (model.kind === "sample") return { key: SAMPLE_MODEL_KEY, name: "Sample booth", unit: "m" };
  return { key: modelKeyFor(model.name, model.size), name: model.name, unit: model.unit };
}