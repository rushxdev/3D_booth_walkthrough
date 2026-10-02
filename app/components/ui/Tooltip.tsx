"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={400} skipDelayDuration={250}>
      {children}
    </RadixTooltip.Provider>
  );
}

type TooltipProps = {
  label: string;
  shortcut?: string;
  side?: "top" | "right" | "bottom" | "left";
  children: ReactNode; // must be a single focusable element
};

export function Tooltip({ label, shortcut, side = "bottom", children }: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="z-50 flex items-center gap-2 rounded-sm border border-line-strong bg-surface-2 px-2 py-1 text-xs text-fg"
        >
          {label}
          {shortcut && (
            <kbd className="rounded-sm border border-line px-1 font-mono text-[10px] text-fg-secondary">
              {shortcut}
            </kbd>
          )}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}