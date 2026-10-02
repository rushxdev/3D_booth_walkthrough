"use client";

import { useUiStore } from "./../../store/useUiStore";

const OVERVIEW_HINTS: Array<[string, string]> = [
  ["Left drag", "Rotate"],
  ["Right drag", "Pan"],
  ["Wheel", "Zoom"],
  ["F", "Frame model"],
];

export function ViewportHints() {
  const mode = useUiStore((s) => s.mode);
  if (mode !== "overview") return null;

  return (
    <div className="pointer-events-none absolute bottom-3 left-3 flex gap-3 rounded-md border border-line bg-surface-1 px-2 py-1 text-xs">
      {OVERVIEW_HINTS.map(([key, action]) => (
        <span key={key} className="whitespace-nowrap">
          <span className="text-fg">{key}</span> <span className="text-fg-secondary">{action}</span>
        </span>
      ))}
    </div>
  );
}