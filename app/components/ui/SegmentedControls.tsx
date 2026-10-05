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
  disabled?: boolean;
  hint?: string;
};

type SegmentedControlProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SegmentOption[];
  iconOnly?: boolean;
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
      onValueChange={(v) => {
        if (v) onValueChange(v);
      }}
      disabled={disabled}
      {...aria}
      className={cn(
        "inline-flex h-(--control-h) shrink-0 items-center gap-0.5 rounded-md border border-line bg-surface-2 p-0.5",
        className,
      )}
    >
      {options.map((o) => {
        const Icon = o.icon;
        const item = (
          <ToggleGroup.Item
            key={o.value}
            value={o.value}
            disabled={o.disabled}
            title={o.disabled ? o.hint : undefined}
            aria-label={iconOnly ? o.label : undefined}
            className={cn(
              "inline-flex h-full shrink-0 items-center justify-center gap-1.5 rounded-sm text-sm text-fg-secondary transition-colors",
              iconOnly ? "h-6 w-6 min-w-6" : "px-2 min-w-0",
              "hover:text-fg data-[state=on]:bg-accent-subtle data-[state=on]:text-accent-text data-[state=on]:hover:text-accent-text",
              "data-disabled:pointer-events-none data-disabled:text-fg-disabled",
            )}
          >
            {Icon && <Icon size={14} strokeWidth={1.75} aria-hidden />}
            {!iconOnly && <span className="truncate">{o.label}</span>}
          </ToggleGroup.Item>
        );

        if (!iconOnly) return item;

        return (
          <Tooltip key={o.value} label={o.label} shortcut={o.shortcut}>
            {/* If your Tooltip wrapper supports asChild, use it. Otherwise a span with flex keeps layout stable */}
            <span className="inline-flex shrink-0 items-center justify-center">
              {item}
            </span>
          </Tooltip>
        );
      })}
    </ToggleGroup.Root>
  );
}