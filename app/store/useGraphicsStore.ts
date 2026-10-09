import { create } from "zustand";

export type GraphicsStatus = "ok" | "lost" | "stuck";

type GraphicsState = {
  status: GraphicsStatus;
  markLost: () => void;
  markRestored: () => void;
  /** Only meaningful while still lost. */
  markStuck: () => void;
  reset: () => void;
};

/** Runtime state only. */
export const useGraphicsStore = create<GraphicsState>((set) => ({
  status: "ok",
  markLost: () => set({ status: "lost" }),
  markRestored: () => set({ status: "ok" }),
  markStuck: () => set((s) => (s.status === "lost" ? { status: "stuck" } : s)),
  reset: () => set({ status: "ok" }),
}));