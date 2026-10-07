"use client";

import { Button } from "./../ui/Button";
import { describeRenderError } from "@/app/lib/errorBoundary";

type Props = { error: unknown; onReload: () => void; onCloseModel: () => void; hasModel: boolean };

export function CanvasFallback({ error, onReload, onCloseModel, hasModel }: Props) {
  const d = describeRenderError(error);
  return (
    <div role="alert" className="absolute inset-0 z-10 flex items-center justify-center bg-surface-0 p-6">
      <div className="max-w-sm space-y-3 rounded-sm border border-line bg-surface-1 p-4 text-sm">
        <p className="font-medium text-fg">{d.title}</p>
        <p className="text-fg-secondary">{d.detail}</p>
        {d.technical && <p className="break-words text-xs text-fg-secondary">{d.technical}</p>}
        <div className="flex justify-end gap-1">
          {hasModel && <Button onClick={onCloseModel}>Close model</Button>}
          <Button variant="primary" onClick={onReload}>
            Reload scene
          </Button>
        </div>
      </div>
    </div>
  );
}