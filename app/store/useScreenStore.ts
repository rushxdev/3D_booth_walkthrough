import { create } from "zustand";
import { newId } from "./../lib/id";
import { MAX_NAME_LENGTH, createScreen, nextScreenName, sanitizeScreenPatch } from "./../lib/schema";
import type { Screen, ScreenPatch } from "./../lib/schema";
import { offsetAlongRight } from "./../three/screens/placement";

/** A locked screen ignores these. Name, visibility and the lock flag itself always work. */
const LOCK_PROTECTED = ["position", "rotation", "width", "height", "content"] as const;
const DUPLICATE_OFFSET = 0.3; // meters, along the screen's right side

type ScreenState = {
  screens: Screen[];
  selectedId: string | null;
  add: (overrides?: ScreenPatch) => string;
  update: (id: string, patch: ScreenPatch) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => string | null;
  select: (id: string | null) => void;
  replaceAll: (screens: Screen[]) => void;
};

export const useScreenStore = create<ScreenState>()((set, get) => ({
  screens: [],
  selectedId: null,

  add: (overrides = {}) => {
    const id = newId();
    const screen = createScreen(id, nextScreenName(get().screens), overrides);
    set((s) => ({ screens: [...s.screens, screen], selectedId: id }));
    return id;
  },

  update: (id, patch) =>
    set((state) => {
      const index = state.screens.findIndex((s) => s.id === id);
      if (index === -1) return state;
      const current = state.screens[index];

      const clean = sanitizeScreenPatch(patch);
      if (current.locked) for (const key of LOCK_PROTECTED) delete clean[key];
      if (Object.keys(clean).length === 0) return state;

      const screens = state.screens.slice();
      screens[index] = { ...current, ...clean };
      return { screens };
    }),

  remove: (id) =>
    set((s) =>
      s.screens.some((x) => x.id === id)
        ? { screens: s.screens.filter((x) => x.id !== id), selectedId: s.selectedId === id ? null : s.selectedId }
        : s,
    ),

  duplicate: (id) => {
    const source = get().screens.find((s) => s.id === id);
    if (!source) return null;
    const copy: Screen = {
      ...source,
      id: newId(),
      name: `${source.name} copy`.slice(0, MAX_NAME_LENGTH),
      position: offsetAlongRight(source.position, source.rotation, DUPLICATE_OFFSET),
      rotation: [...source.rotation],
      content: { ...source.content },
      resolution: [...source.resolution],
      locked: false, // the copy is meant to be moved
    };
    set((s) => ({ screens: [...s.screens, copy], selectedId: copy.id }));
    return copy.id;
  },

  replaceAll: (screens) => 
    set({ 
      screens: screens.slice(), 
      selectedId: null 
    }),

  select: (id) => 
    set((s) => (
      id === null || s.screens.some((x) => 
        x.id === id) ? { selectedId: id } : s)),
}));