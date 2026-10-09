import { create } from "zustand";

export type Fault = { source: string; error: unknown };

type FaultState = {
  fault: Fault | null;
  /** The first fault wins; later ones are consequences of it. */
  report: (source: string, error: unknown) => void;
  clear: () => void;
};

/** Runtime state only. A per-frame failure that the canvas boundary cannot see. */
export const useFaultStore = create<FaultState>((set) => ({
  fault: null,
  report: (source, error) => set((s) => (s.fault ? s : { fault: { source, error } })),
  clear: () => set({ fault: null }),
}));