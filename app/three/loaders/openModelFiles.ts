import { pickFiles } from "./../../lib/pickFiles";
import { useSceneStore } from "./../../store/useSceneStore";
import { isAllowedExtension, validateModelFile } from "./validate";
import { errorIssue } from "./errors";
import { useLoadProgressStore } from "./../../store/useLoadProgressStore";

let currentLoad = 0;

/** Single entry point for "the user gave us files", from the dialog or a drop. */
export async function openModelFiles(files: File[]): Promise<boolean> {
  const primary = files.find((f) => isAllowedExtension(f.name)) ?? files[0];
  if (!primary) return false;

  const store = useSceneStore.getState();
  const result = validateModelFile(primary);
  if (!result.ok) {
    store.setIssue(result.error);
    return false;
  }
  store.setIssue(result.warning ?? null);

  const token = ++currentLoad;
  const mine = () => token === currentLoad;
  const progress = () => useLoadProgressStore.getState();

  store.setLoadingName(primary.name);
  progress().begin();
  try {
    // Loaded on demand so three's loaders stay out of the initial shell bundle.
    const { loadModel } = await import("./loadModel");
    const loaded = await loadModel(primary, {
      onProgress: (f) => mine() && progress().setFraction(f),
      onProcessing: () => mine() && progress().setProcessing(),
      shouldCancel: () => !mine(),
    });
    if (!mine()) return false; // a newer open superseded this one and owns the progress now

    const s = useSceneStore.getState();
    s.setLoadingName(null);
    progress().reset();
    if (!loaded.ok) {
      s.setIssue(loaded.error);
      return false;
    }
    s.setModel({
      kind: "file",
      name: primary.name,
      size: primary.size,
      scene: loaded.scene,
      measure: loaded.measure,
      unit: loaded.unit,
      detectedUnit: loaded.unit,
      file: primary,
    });
    return true;
  } catch (err) {
    console.error("[openModelFiles]", err);
    if (!mine()) return false;
    const s = useSceneStore.getState();
    s.setLoadingName(null);
    progress().reset();
    s.setIssue(errorIssue("unexpected", "Something went wrong", "The model could not be opened. Reload the page and try again."));
    return false;
  }
}

export function openModelDialog(): void {
  // multiple: so a .gltf can come with its .bin and textures (3.5)
  pickFiles({ accept: ".glb,.gltf", multiple: true }, openModelFiles);
}