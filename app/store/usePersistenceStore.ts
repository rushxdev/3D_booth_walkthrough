import { create } from "zustand";

export type SaveState = "idle" | "saved" | "error";

type PersistenceState = {
  saveState: SaveState;
  /** Why saving is failing, shown with a continue-without-saving path. */
  errorMessage: string | null;
  /** One-time "Restored previous session" line. */
  notice: string | null;
  /** True while the startup restore runs, so autosave never overwrites what is about to load. */
  restoring: boolean;

  markSaved: () => void;
  markError: (message: string) => void;
  setNotice: (notice: string | null) => void;
  setRestoring: (restoring: boolean) => void;
  reset: () => void;
};

const initial = { saveState: "idle" as SaveState, errorMessage: null, notice: null, restoring: false };

/** Runtime state only. Never saved or exported. */
export const usePersistenceStore = create<PersistenceState>((set) => ({
  ...initial,
  markSaved: () => set({ saveState: "saved", errorMessage: null }),
  markError: (errorMessage) => set({ saveState: "error", errorMessage }),
  setNotice: (notice) => set({ notice }),
  setRestoring: (restoring) => set({ restoring }),
  reset: () => set({ ...initial }),
}));