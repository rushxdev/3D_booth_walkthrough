import { pickFiles } from "./../../lib/pickFiles";
import { useSceneStore } from "./../../store/useSceneStore";
import { isAllowedExtension, validateModelFile } from "./validate";

/** Single entry point for "the user gave us files", from the dialog or a drop. */
export function openModelFiles(files: File[]): void {
  const primary = files.find((f) => isAllowedExtension(f.name)) ?? files[0];
  if (!primary) return;

  const { setIssue } = useSceneStore.getState();
  const result = validateModelFile(primary);
  if (!result.ok) {
    setIssue(result.error);
    return;
  }
  setIssue(result.warning ?? null);

  // TODO(3.3): replace with loadModel(primary)
  console.info("[open] accepted", primary.name, primary.size);
}

export function openModelDialog(): void {
  // multiple: so a .gltf can come with its .bin and textures (3.5)
  pickFiles({ accept: ".glb,.gltf", multiple: true }, openModelFiles);
}