import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "./../../lib/cn";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "default" | "primary";
  icon?: LucideIcon;
  /** Shown as a tooltip while disabled, so the button explains itself. */
  disabledHint?: string;
};

export function Button({
  variant = "default",
  icon: Icon,
  disabled = false,
  disabledHint,
  className,
  children,
  type = "button",
  onClick,
  title,
  ...rest
}: ButtonProps) {
  // aria-disabled instead of disabled: it stays focusable and hoverable, so the hint can show
  // (same approach as IconButton). The click is simply not wired up.
  return (
    <button
      type={type}
      aria-disabled={disabled || undefined}
      title={disabled ? disabledHint : title}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "inline-flex h-(--control-h) shrink-0 items-center justify-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors",
        disabled
          ? "cursor-default border-line bg-surface-2 text-fg-disabled"
          : variant === "primary"
            ? "border-accent bg-accent text-white hover:border-accent-hover hover:bg-accent-hover active:bg-accent"
            : "border-line-strong bg-surface-2 text-fg hover:bg-line active:bg-line-strong",
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={14} strokeWidth={1.75} aria-hidden />}
      {children}
    </button>
  );
}