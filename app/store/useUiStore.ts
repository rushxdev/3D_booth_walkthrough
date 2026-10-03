import { create } from "zustand";

export type ViewMode = "overview" | "walk";
export const isViewMode = (v: string): v is ViewMode => v === "overview" || v === "walk";

type UiState = {
  mode: ViewMode;
  frameTick: number; // bumped to ask the camera to re-frame the model
  walkLocked: boolean; 
  setMode: (mode: ViewMode) => void;
  requestFrame: () => void;
  setWalkLocked: (locked: boolean) => void;
};

export const useUiStore = create<UiState>()((set) => ({
  mode: "overview",
  frameTick: 0,
  walkLocked: false,
  setWalkLocked: (locked) => set({ walkLocked: locked }),
  setMode: (mode) => set({ mode }),
  requestFrame: () => set((s) => ({ frameTick: s.frameTick + 1 })),
}));