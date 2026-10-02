import { create } from "zustand";
import type { LoadIssue } from "./../three/loaders/errors";

export type ModelSource = { kind: "sample" };

type SceneState = {
  model: ModelSource | null;
  issue: LoadIssue | null;
  loadSample: () => void;
  clearModel: () => void;
  setIssue: (issue: LoadIssue | null) => void;
};

export const useSceneStore = create<SceneState>()((set) => ({
  model: null,
  issue: null,
  loadSample: () => set({ model: { kind: "sample" }, issue: null }),
  clearModel: () => set({ model: null }),
  setIssue: (issue) => set({ issue }),
}));