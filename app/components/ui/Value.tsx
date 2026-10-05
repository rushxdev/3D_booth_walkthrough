import type { ReactNode } from "react";

/** A read-only value in a settings row. */
export function Value({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span title={title} className="tabular min-w-0 truncate text-right text-sm text-fg">
      {children}
    </span>
  );
}