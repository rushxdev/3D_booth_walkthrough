"use client";

import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "./../../lib/cn";
import { Tooltip } from "./Tooltip";

type IconButtonProps = Omit<ComponentProps<"button">, "children" | "aria-label"> & {
  icon: LucideIcon;
  label: string;          // required: becomes aria-label AND tooltip text
  shortcut?: string;
  active?: boolean;       // toggled-on state (e.g. current tool)
  size?: "sm" | "md";     // 24px | 28px
  tooltipSide?: "top" | "right" | "bottom" | "left";
};

export function IconButton({
  icon: Icon,
  label,
  shortcut,
  active = false,
  size = "md",
  tooltipSide,
  disabled = false,
  onClick,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <Tooltip label={label} shortcut={shortcut} side={tooltipSide}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active || undefined}
        aria-disabled={disabled || undefined}
        onClick={disabled ? undefined : onClick}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md border border-transparent transition-colors",
          size === "md" ? "size-7" : "size-6",
          disabled
            ? "cursor-default text-fg-disabled"
            : active
              ? "bg-accent-subtle text-accent-text"
              : "text-fg-secondary hover:bg-surface-2 hover:text-fg active:bg-line",
          className,
        )}
        {...rest}
      >
        <Icon size={16} strokeWidth={1.75} aria-hidden />
      </button>
    </Tooltip>
  );
}