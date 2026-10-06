import { create } from "zustand";

export type VideoPhase = "loading" | "ready" | "error";

export type VideoStatus = {
  phase: VideoPhase;
  /** videoWidth / videoHeight once metadata is known. */
  aspect: number | null;
  playing: boolean;
  muted: boolean;
  message: string | null;
};

export const initialVideoStatus = (): VideoStatus => ({
  phase: "loading",
  aspect: null,
  playing: false,
  muted: true, // autoplay policy: always start muted
  message: null,
});

type VideoState = {
  byScreen: Record<string, VideoStatus>;
  patch: (screenId: string, patch: Partial<VideoStatus>) => void;
  clear: (screenId: string) => void;
  reset: () => void;
};

/** Runtime playback state. Never saved or exported. */
export const useVideoStore = create<VideoState>((set) => ({
  byScreen: {},
  patch: (screenId, patch) =>
    set((s) => ({
      byScreen: {
        ...s.byScreen,
        [screenId]: { ...(s.byScreen[screenId] ?? initialVideoStatus()), ...patch },
      },
    })),
  clear: (screenId) =>
    set((s) => {
      if (!(screenId in s.byScreen)) return s;
      const next = { ...s.byScreen };
      delete next[screenId];
      return { byScreen: next };
    }),
  reset: () => set({ byScreen: {} }),
}));