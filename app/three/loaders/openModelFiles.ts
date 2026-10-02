import { pickFiles } from "./../../lib/pickFiles";
import { useSceneStore } from "./../../store/useSceneStore";
import { isAllowedExtension, validateModelFile } from "./validate";
import { errorIssue } from "./errors";

let currentLoad = 0;

/** Single entry point for "the user gave us files", from the dialog or a drop. */
export async function openModelFiles(files: File[]): Promise<void> {
  const primary = files.find((f) => isAllowedExtension(f.name)) ?? files[0];
  if (!primary) return;

  const store = useSceneStore.getState();
  const result = validateModelFile(primary);
  if (!result.ok) {
    store.setIssue(result.error);
    return;
  }
  store.setIssue(result.warning ?? null);

  const token = ++currentLoad;
  store.setLoadingName(primary.name);
  try {
    // Loaded on demand so three's loaders stay out of the initial shell bundle.
    const { loadModel } = await import("./loadModel");
    const loaded = await loadModel(primary);
    if (token !== currentLoad) return; // a newer open superseded this one

    const s = useSceneStore.getState();
    s.setLoadingName(null);
    if (!loaded.ok) {
      s.setIssue(loaded.error);
      return;
    }
    s.setModel({ kind: "file", name: primary.name, size: primary.size, scene: loaded.scene });
  } catch (err) {
    console.error("[openModelFiles]", err);
    if (token !== currentLoad) return;
    const s = useSceneStore.getState();
    s.setLoadingName(null);
    s.setIssue(errorIssue("unexpected", "Something went wrong", "The model could not be opened. Reload the page and try again."));
  }
}

export function openModelDialog(): void {
  // multiple: so a .gltf can come with its .bin and textures (3.5)
  pickFiles({ accept: ".glb,.gltf", multiple: true }, openModelFiles);
}