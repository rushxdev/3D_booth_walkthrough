"use client";

import { useEffect } from "react";
import { isTypingTarget } from "./../../lib/isTypingTarget";
import { useUiStore } from "./../../store/useUiStore";

/** Single place for global keyboard shortcuts. Later phases add W, E, R, P, Delete here. */
export function Shortcuts() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      if (isTypingTarget(e.target as HTMLElement | null)) return;

      const ui = useUiStore.getState();
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
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}