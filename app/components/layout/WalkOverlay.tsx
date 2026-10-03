"use client";

import { useUiStore } from "./../../store/useUiStore";
import { requestPointerLock } from "./../../three/controls/walkLock";

const CONTROLS: Array<[string, string]> = [
  ["W A S D or arrows", "Move"],
  ["Shift", "Run"],
  ["Mouse", "Look"],
  ["Esc", "Release the mouse"],
];

export function WalkOverlay() {
  const mode = useUiStore((s) => s.mode);
  const locked = useUiStore((s) => s.walkLocked);
  if (mode !== "walk" || locked) return null;

  return (
    <button
      type="button"
      onClick={requestPointerLock}
      className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center -outline-offset-2"
    >
      <span className="flex w-72 flex-col gap-2 rounded-md border border-line-strong bg-surface-1 p-4 text-left">
        <span className="text-base font-medium text-fg">Click to enter walk mode</span>
        <span className="flex flex-col gap-1">
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