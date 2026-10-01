import type { ReactNode } from "react";
import { cn } from "./../../lib/cn";

type RowProps = {
  label: string;
  htmlFor?: string;   // id of the control, so clicking the label focuses it
  disabled?: boolean;
  children: ReactNode; // the compact control
};

export function Row({ label, htmlFor, disabled = false, children }: RowProps) {
  return (
    <div className="grid min-h-(--row-h) grid-cols-[96px_1fr] items-center gap-2">
      <label
        htmlFor={htmlFor}
        title={label}
        className={cn("truncate text-sm", disabled ? "text-fg-disabled" : "text-fg-secondary")}
      >
        {label}
      </label>
      <div className="flex min-w-0 items-center justify-end gap-1">{children}</div>
    </div>
  );
}