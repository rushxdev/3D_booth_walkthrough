import { create } from "zustand";
import type { Group } from "three";
import type { LoadIssue } from "./../three/loaders/errors";

export type ModelSource =
  | { kind: "sample" }
  | { kind: "file"; name: string; size: number; scene: Group };

type SceneState = {
  model: ModelSource | null;
  loadingName: string | null;
  issue: LoadIssue | null;
  loadSample: () => void;
  setModel: (model: ModelSource) => void;
  clearModel: () => void;
  setLoadingName: (name: string | null) => void;
  setIssue: (issue: LoadIssue | null) => void;
};

export const useSceneStore = create<SceneState>()((set) => ({
  model: null,
  loadingName: null,
  issue: null,
  loadSample: () => set({ model: { kind: "sample" }, issue: null }),
  setModel: (model) => set({ model }),
  setLoadingName: (loadingName) => set({ loadingName }),
  clearModel: () => set({ model: null }),
  setIssue: (issue) => set({ issue }),
}));