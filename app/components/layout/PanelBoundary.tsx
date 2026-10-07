"use client";

import type { ReactNode } from "react";
import { Button } from "./../ui/Button";
import { ErrorBoundary } from "./../ui/ErrorBoundary";
import { useScreenStore } from "@/app/store/useScreenStore";

/** One per panel section, so a failing section never takes the others down. */
export function PanelBoundary({ name, children }: { name: string; children: ReactNode }) {
  const selectedId = useScreenStore((s) => s.selectedId);
  return (
    <ErrorBoundary
      resetKeys={[selectedId]} // picking another screen is the usual way out of a bad state
      fallback={(_error, reset) => (
        <div role="alert" className="flex items-center gap-2 border-b border-line px-3 py-2 text-xs">
          <span className="text-danger">{name} could not be shown.</span>
          <div className="flex-1" />
          <Button onClick={reset}>Retry</Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}