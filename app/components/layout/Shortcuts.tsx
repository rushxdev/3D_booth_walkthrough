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
      const editing = !ui.walkLocked; 
      const mod = e.ctrlKey || e.metaKey;
      const selectedScreen = () => {
      const s = useScreenStore.getState();
        return s.screens.find((x) => x.id === s.selectedId);
      };

      if (mod && !e.altKey && e.key.toLowerCase() === "d") {
        if (editing && screens.selectedId) {
          e.preventDefault(); 
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
                case "w":
          if (ui.mode === "overview") {
            e.preventDefault();
            ui.setGizmoMode("translate");
          }
          break;
        case "e":
          if (ui.mode === "overview") {
            e.preventDefault();
            ui.setGizmoMode("rotate");
          }
          break;
        case "s": {
          const selected = selectedScreen();
          if (ui.mode === "overview" && selected && !selected.locked) {
            e.preventDefault();
            ui.setPlacing(!ui.placing);
          }
          break;
        }
        case "escape":
          if (ui.placing) ui.setPlacing(false);
          break;
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}