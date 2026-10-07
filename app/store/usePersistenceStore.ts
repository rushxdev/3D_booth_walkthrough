import { create } from "zustand";

export type SaveState = "idle" | "saved" | "error";

type PersistenceState = {
  saveState: SaveState;
  /** Why saving is failing. */
  errorMessage: string | null;
  /** One-line status such as "Restored previous session". */
  notice: string | null;
  /** True while a model's setup is being loaded. */
  restoring: boolean;
  /** "Continue without saving": autosave is skipped for this session. */
  savingPaused: boolean;

  markSaved: () => void;
  markError: (message: string) => void;
  setNotice: (notice: string | null) => void;
  setRestoring: (restoring: boolean) => void;
  pauseSaving: () => void;
  resumeSaving: () => void;
  reset: () => void;
};

const initial = {
  saveState: "idle" as SaveState,
  errorMessage: null,
  notice: null,
  restoring: false,
  savingPaused: false,
};

/** Runtime state only. Never saved or exported. */
export const usePersistenceStore = create<PersistenceState>((set) => ({
  ...initial,
  markSaved: () => set({ saveState: "saved", errorMessage: null }),
  markError: (errorMessage) => set({ saveState: "error", errorMessage }),
  setNotice: (notice) => set({ notice }),
  setRestoring: (restoring) => set({ restoring }),
  pauseSaving: () => set({ savingPaused: true }),
  resumeSaving: () => set({ savingPaused: false, saveState: "idle", errorMessage: null }),
  reset: () => set({ ...initial }),
}));