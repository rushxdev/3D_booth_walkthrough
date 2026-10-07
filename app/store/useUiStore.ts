import { create } from "zustand";
import { clamp } from "./../lib/number";

export type ViewMode = "overview" | "walk";
export const isViewMode = (v: string): v is ViewMode => v === "overview" || v === "walk";

export type GizmoMode = "translate" | "rotate";
export const isGizmoMode = (v: string): v is GizmoMode => v === "translate" || v === "rotate";

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
  lockAspect: boolean; // while editing a screen's size, keep its shape
  gizmoMode: GizmoMode;
  snap: boolean;       // snap gizmo moves to 5 cm and rotations to 5 degrees
  placing: boolean;    // the Place on surface tool is active
  presentation: boolean;
  setMode: (mode: ViewMode) => void;
  requestFrame: () => void;
  requestReset: () => void;
  setWalkLocked: (locked: boolean) => void;
  setWalkSpeed: (v: number) => void;
  setLookSensitivity: (v: number) => void;
  setLockAspect: (locked: boolean) => void;
  setGizmoMode: (mode: GizmoMode) => void;
  setSnap: (snap: boolean) => void;
  setPlacing: (placing: boolean) => void;
  setPresentation: (on: boolean) => void;
};

export const useUiStore = create<UiState>()((set) => ({
  mode: "overview",
  frameTick: 0,
  resetTick: 0,
  walkLocked: false,
  walkSpeed: DEFAULT_WALK_SPEED,
  lookSensitivity: DEFAULT_LOOK_SENSITIVITY,
  lockAspect: false,
  gizmoMode: "translate",
  snap: false,
  placing: false,
  presentation: false,
  setMode: (mode) => set({ mode, placing: false }), // the Place tool is an Overview tool
  requestFrame: () => set((s) => ({ frameTick: s.frameTick + 1 })),
  requestReset: () => set((s) => ({ resetTick: s.resetTick + 1 })),
  setWalkLocked: (walkLocked) => set({ walkLocked }),
  setWalkSpeed: (v) => set(Number.isFinite(v) ? { walkSpeed: clamp(v, WALK_SPEED_RANGE.min, WALK_SPEED_RANGE.max) } : {}),
  setLookSensitivity: (v) =>
    set(Number.isFinite(v) ? { lookSensitivity: clamp(v, LOOK_SENSITIVITY_RANGE.min, LOOK_SENSITIVITY_RANGE.max) } : {}),
  setLockAspect: (lockAspect) => set({ lockAspect }),
  setGizmoMode: (gizmoMode) => set({ gizmoMode }),
  setSnap: (snap) => set({ snap }),
  setPlacing: (placing) => set({ placing }),
  setPresentation: (presentation) => set(presentation ? { presentation, placing: false } : { presentation }),
}));