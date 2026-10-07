import { create } from "zustand";
import type { Group } from "three";
import type { LoadIssue } from "./../three/loaders/errors";
import type { Unit } from "./../lib/units";
import type { ModelMeasure } from "./../three/loaders/normalize";

export type ModelSource =
  | { kind: "sample" }
  | {
      kind: "file";
      name: string;
      size: number;
      scene: Group;
      measure: ModelMeasure;
      unit: Unit;          // what the user (or the guess) says the file uses
      detectedUnit: Unit;
      file?: File;  // the original guess, kept so the panel can show it
    };

type SceneState = {
  model: ModelSource | null;
  loadingName: string | null;
  issue: LoadIssue | null;
  loadSample: () => void;
  setModel: (model: ModelSource) => void;
  setModelUnit: (unit: Unit) => void;
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
  setModelUnit: (unit) =>
  set((s) => (s.model?.kind === "file" ? { model: { ...s.model, unit } } : {})),
  setLoadingName: (loadingName) => set({ loadingName }),
  clearModel: () => set({ model: null }),
  setIssue: (issue) => set({ issue }),
}));