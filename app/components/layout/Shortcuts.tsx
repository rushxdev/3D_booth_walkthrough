"use client";

import { useEffect } from "react";
import { isTypingTarget } from "./../../lib/isTypingTarget";
import { useScreenStore } from "./../../store/useScreenStore";
import { useUiStore } from "./../../store/useUiStore";

/** Single place for global keyboard shortcuts. */
export function Shortcuts() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat || isTypingTarget(e.target as HTMLElement | null)) return;

      const ui = useUiStore.getState();
      const screens = useScreenStore.getState();
      const editing = !ui.walkLocked; // with the mouse captured there is nothing to select or edit
      const mod = e.ctrlKey || e.metaKey;

      if (mod && !e.altKey && e.key.toLowerCase() === "d") {
        if (editing && screens.selectedId) {
          e.preventDefault(); // otherwise the browser bookmarks the page
          screens.duplicate(screens.selectedId);
        }
        return;
      }
      if (mod || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "f":
          if (ui.mode === "overview") {
            e.preventDefault();
            ui.requestFrame();
          }
          break;
        case "r":
          if (ui.mode === "walk") {
            e.preventDefault();
            ui.requestReset();
          }
          break;
        case "delete":
        case "backspace":
          if (editing && screens.selectedId) {
            e.preventDefault();
            screens.remove(screens.selectedId);
          }
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}