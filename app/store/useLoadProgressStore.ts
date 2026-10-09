import { create } from "zustand";

export type LoadStage = "idle" | "reading" | "processing";

type LoadProgressState = {
  stage: LoadStage;
  /** 0 to 1, meaningful while reading. */
  fraction: number;
  begin: () => void;
  setFraction: (fraction: number) => void;
  setProcessing: () => void;
  reset: () => void;
};

/** Runtime state only. */
export const useLoadProgressStore = create<LoadProgressState>((set) => ({
  stage: "idle",
  fraction: 0,
  begin: () => set({ stage: "reading", fraction: 0 }),
  setFraction: (fraction) =>
    set((s) => (s.stage === "reading" ? { fraction: Math.min(1, Math.max(0, fraction)) } : s)),
  setProcessing: () => set({ stage: "processing", fraction: 1 }),
  reset: () => set({ stage: "idle", fraction: 0 }),
}));