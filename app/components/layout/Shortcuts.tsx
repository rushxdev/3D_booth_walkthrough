"use client";

import { useEffect } from "react";
import { isTypingTarget } from "./../../lib/isTypingTarget";
import { useSceneStore } from "./../../store/useSceneStore";
import { useScreenStore } from "./../../store/useScreenStore";
import { useUiStore } from "./../../store/useUiStore";
import { presentationKeyAction } from "@/app/presentation/presentationKeys";
import { togglePresentation, toggleView } from "@/app/presentation/presentationControl";
import { isPresenting } from "@/app/presentation/usePresenting";
import { isHelpKey } from "@/app/shortcuts/shortcutList";
import { useHelpStore } from "@/app/store/useHelpStore";

/** Single place for global keyboard shortcuts. */
export function Shortcuts() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat || isTypingTarget(e.target as HTMLElement | null)) return;

      const presenting = isPresenting();
      const action = presentationKeyAction(e, {
        presenting,
        hasModel: useSceneStore.getState().model !== null,
      });

      if (action === "toggle-presentation") {
        e.preventDefault();
        togglePresentation({ fullscreen: true });
        return;
      }

      if (action === "toggle-view") {
        e.preventDefault();
        toggleView();
        return;
      }
      
      if (isHelpKey(e)) {
        if (useUiStore.getState().walkLocked) return; // the list could not be read or closed
        e.preventDefault();
        useHelpStore.getState().toggle();
        return;
      }

      const ui = useUiStore.getState();
      const screens = useScreenStore.getState();
      const editing = !presenting && !ui.walkLocked;
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
          if (!presenting && ui.mode === "overview") {
            e.preventDefault();
            ui.setGizmoMode("translate");
          }
          break;
        case "e":
          if (!presenting && ui.mode === "overview") {
            e.preventDefault();
            ui.setGizmoMode("rotate");
          }
          break;
        case "s": {
          const selected = selectedScreen();
          if (!presenting && ui.mode === "overview" && selected && !selected.locked) {
            e.preventDefault();
            ui.setPlacing(!ui.placing);
          }
          break;
        }
        case "escape": {
          const help = useHelpStore.getState();
          if (help.open) help.close();
          else if (ui.placing) ui.setPlacing(false);
          break;
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}