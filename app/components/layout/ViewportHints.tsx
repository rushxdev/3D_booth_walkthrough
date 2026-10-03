"use client";

import { useUiStore } from "./../../store/useUiStore";

const OVERVIEW_HINTS: Array<[string, string]> = [
  ["Left drag", "Rotate"],
  ["Right drag", "Pan"],
  ["Wheel", "Zoom"],
  ["F", "Frame model"],
];

const WALK_HINTS: Array<[string, string]> = [
  ["W A S D", "Move"],
  ["Shift", "Run"],
  ["Mouse", "Look"],
  ["Esc", "Release mouse"],
];

export function ViewportHints() {
  const mode = useUiStore((s) => s.mode);
  const locked = useUiStore((s) => s.walkLocked);
  if (mode === "walk" && !locked) return null; // the enter overlay already lists the controls

  const hints = mode === "walk" ? WALK_HINTS : OVERVIEW_HINTS;
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 flex gap-3 rounded-md border border-line bg-surface-1 px-2 py-1 text-xs">
      {hints.map(([key, action]) => (
        <span key={key} className="whitespace-nowrap">
          <span className="text-fg">{key}</span> <span className="text-fg-secondary">{action}</span>
        </span>
      ))}
    </div>
  );
}