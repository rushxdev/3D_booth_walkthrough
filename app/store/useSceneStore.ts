import { create } from "zustand";

// Phase 3 extends this with { kind: "file"; ... }
export type ModelSource = { kind: "sample" };

type SceneState = {
  model: ModelSource | null;
  loadSample: () => void;
  clearModel: () => void;
};

export const useSceneStore = create<SceneState>()((set) => ({
  model: null,
  loadSample: () => set({ model: { kind: "sample" } }),
  clearModel: () => set({ model: null }),
}));