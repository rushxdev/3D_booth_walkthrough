"use client";

import { X } from "lucide-react";
import { IconButton } from "./../../components/ui/IconButton";
import { cn } from "./../../lib/cn";
import { useSceneStore } from "./../../store/useSceneStore";
import { useLoadProgressStore } from "./../../store/useLoadProgressStore";

export function ViewportNotice() {
  const issue = useSceneStore((s) => s.issue);
  const setIssue = useSceneStore((s) => s.setIssue);
  const loadingName = useSceneStore((s) => s.loadingName);
  const stage = useLoadProgressStore((s) => s.stage);
  const fraction = useLoadProgressStore((s) => s.fraction);
  
  if (loadingName) {
    const reading = stage === "reading";
    const percent = Math.round(fraction * 100);
    return (
      <div className="absolute top-3 left-1/2 z-10 w-72 max-w-[calc(100%-1.5rem)] -translate-x-1/2 overflow-hidden rounded-md border border-line-strong bg-surface-1">
        <div role="status" className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm text-fg-secondary">
          <span className="min-w-0 truncate">
            {reading ? "Reading" : "Processing"} {loadingName}…
          </span>
          {reading && (
            <span aria-hidden className="shrink-0 tabular-nums">
              {percent}%
            </span>
          )}
        </div>
        <div
          role="progressbar"
          aria-label="Loading model"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={reading ? percent : undefined}
          className="h-0.5 bg-surface-0"
        >
          <div className={cn("h-full bg-accent", !reading && "opacity-50")} style={{ width: reading ? `${percent}%` : "100%" }} />
        </div>
      </div>
    );
  }

  if (!issue) return null;

  const isError = issue.severity === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "absolute top-3 left-1/2 z-10 flex w-md max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-start gap-2 rounded-md border bg-surface-1 py-2 pr-1 pl-3",
        isError ? "border-danger" : "border-line-strong",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className={cn("text-sm font-medium", isError ? "text-danger-text" : "text-fg")}>{issue.title}</div>
        <p className="mt-0.5 text-sm text-fg-secondary">{issue.message}</p>
      </div>
      <IconButton icon={X} label="Dismiss" size="sm" onClick={() => setIssue(null)} />
    </div>
  );
}