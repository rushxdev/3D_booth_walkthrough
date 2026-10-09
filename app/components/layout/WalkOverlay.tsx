"use client";

import { useEffect, useRef } from "react";
import { useUiStore } from "./../../store/useUiStore";
import { requestPointerLock } from "./../../three/controls/walkLock";

const CONTROLS: Array<[string, string]> = [
  ["W A S D or arrows", "Move"],
  ["Shift", "Run"],
  ["Mouse", "Look"],
  ["R", "Reset position"],
  ["Esc", "Release the mouse"],
];

export function WalkOverlay() {
  const mode = useUiStore((s) => s.mode);
  const locked = useUiStore((s) => s.walkLocked);
  const button = useRef<HTMLButtonElement>(null);
  const visible = mode === "walk" && !locked;

  // So Enter or Space works right after switching to Walk, or after Esc released the mouse.
  useEffect(() => {
    if (visible) button.current?.focus();
  }, [visible]);

  if (!visible) return null;

  return (
    <button
      ref={button}
      type="button"
      aria-label="Enter walk mode"
      aria-describedby="walk-controls"
      onClick={requestPointerLock}
      className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center -outline-offset-2"
    >
      <span className="flex w-72 flex-col gap-2 rounded-md border border-line-strong bg-surface-1 p-4 text-left">
        <span aria-hidden className="text-base font-medium text-fg">Click to enter walk mode</span>
        <span id="walk-controls" className="flex flex-col gap-1">
          {CONTROLS.map(([keys, action]) => (
            <span key={keys} className="flex justify-between gap-4 text-sm">
              <span className="text-fg">{keys}</span>
              <span className="text-fg-secondary">{action}</span>
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}