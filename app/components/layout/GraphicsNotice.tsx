"use client";

import { Button } from "./../ui/Button";
import { useGraphicsStore } from "@/app/store/useGraphicsStore";

export function GraphicsNotice({ onReload }: { onReload: () => void }) {
  const status = useGraphicsStore((s) => s.status);
  if (status === "ok") return null;

  return (
    <div
      role="alert"
      className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-sm border border-line bg-surface-1 px-3 py-1.5 text-xs"
    >
      {status === "lost" ? (
        <span className="text-fg-secondary">Graphics were interrupted. Waiting for the browser to restore them…</span>
      ) : (
        <>
          <span className="text-danger">The browser did not restore graphics.</span>
          <Button variant="primary" onClick={onReload}>
            Reload scene
          </Button>
        </>
      )}
    </div>
  );
}