import { create } from "zustand";
import { clamp } from "./../lib/number";

export type ViewMode = "overview" | "walk";
export const isViewMode = (v: string): v is ViewMode => v === "overview" || v === "walk";

export const DEFAULT_WALK_SPEED = 2; // m/s
export const DEFAULT_LOOK_SENSITIVITY = 1;
export const WALK_SPEED_RANGE = { min: 0.5, max: 10 } as const;
export const LOOK_SENSITIVITY_RANGE = { min: 0.2, max: 3 } as const;

type UiState = {
  mode: ViewMode;
  frameTick: number;  // bumped to ask Overview to re-frame
  resetTick: number;  // bumped to ask Walk to respawn
  walkLocked: boolean;
  walkSpeed: number;
  lookSensitivity: number;
  lockAspect: boolean;
  setMode: (mode: ViewMode) => void;
  requestFrame: () => void;
  requestReset: () => void;
  setWalkLocked: (locked: boolean) => void;
  setWalkSpeed: (v: number) => void;
  setLookSensitivity: (v: number) => void;
  setLockAspect: (locked: boolean) => void;
};

export const useUiStore = create<UiState>()((set) => ({
  mode: "overview",
  frameTick: 0,
  resetTick: 0,
  walkLocked: false,
  walkSpeed: DEFAULT_WALK_SPEED,
  lookSensitivity: DEFAULT_LOOK_SENSITIVITY,
  lockAspect: false,
  setMode: (mode) => set({ mode }),
  requestFrame: () => set((s) => ({ frameTick: s.frameTick + 1 })),
  requestReset: () => set((s) => ({ resetTick: s.resetTick + 1 })),
  setWalkLocked: (walkLocked) => set({ walkLocked }),
  setWalkSpeed: (v) => set(Number.isFinite(v) ? { walkSpeed: clamp(v, WALK_SPEED_RANGE.min, WALK_SPEED_RANGE.max) } : {}),
  setLookSensitivity: (v) =>
    set(Number.isFinite(v) ? { lookSensitivity: clamp(v, LOOK_SENSITIVITY_RANGE.min, LOOK_SENSITIVITY_RANGE.max) } : {}),
  setLockAspect: (lockAspect) => set({ lockAspect }),
}));