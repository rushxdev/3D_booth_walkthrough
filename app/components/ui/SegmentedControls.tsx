"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import type { LucideIcon } from "lucide-react";
import { cn } from "./../../lib/cn";
import { Tooltip } from "./Tooltip";

export type SegmentOption = {
  value: string;
  label: string;
  icon?: LucideIcon;
  shortcut?: string;
};

type SegmentedControlProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SegmentOption[];
  iconOnly?: boolean; // show icons only; label becomes aria-label + tooltip
  disabled?: boolean;
  "aria-label": string;
  className?: string;
};

export function SegmentedControl({
  value,
  onValueChange,
  options,
  iconOnly = false,
  disabled = false,
  className,
  ...aria
}: SegmentedControlProps) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      // Radix single mode lets the user deselect (value ""): ignore that.
      onValueChange={(v) => {
        if (v) onValueChange(v);
      }}
      disabled={disabled}
      {...aria}
      className={cn(
        "inline-flex h-(--control-h) items-center gap-px rounded-md border border-line bg-surface-2 p-px",
        className,
      )}
    >
      {options.map((o) => {
        const Icon = o.icon;
        const item = (
          <ToggleGroup.Item
            key={o.value}
            value={o.value}
            aria-label={iconOnly ? o.label : undefined}
            className={cn(
              "inline-flex h-full min-w-0 items-center justify-center gap-1.5 rounded-sm text-sm text-fg-secondary transition-colors",
              iconOnly ? "w-6" : "px-2",
              "hover:text-fg data-[state=on]:bg-accent-subtle data-[state=on]:text-accent-text data-[state=on]:hover:text-accent-text",
              "data-disabled:text-fg-disabled data-disabled:hover:text-fg-disabled",
            )}
          >
            {Icon && <Icon size={14} strokeWidth={1.75} aria-hidden />}
            {!iconOnly && <span className="truncate">{o.label}</span>}
          </ToggleGroup.Item>
        );
        return iconOnly ? (
          <Tooltip key={o.value} label={o.label} shortcut={o.shortcut}>
            {item}
          </Tooltip>
        ) : (
          item
        );
      })}
    </ToggleGroup.Root>
  );
}