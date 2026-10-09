import { create } from "zustand";

type HelpState = { open: boolean; toggle: () => void; close: () => void };

/** Runtime state only. */
export const useHelpStore = create<HelpState>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  close: () => set({ open: false }),
}));