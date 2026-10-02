"use client";

import { X } from "lucide-react";
import { IconButton } from "./../../components/ui/IconButton";
import { cn } from "./../../lib/cn";
import { useSceneStore } from "./../../store/useSceneStore";

export function ViewportNotice() {
  const issue = useSceneStore((s) => s.issue);
  const setIssue = useSceneStore((s) => s.setIssue);
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
        <div className={cn("text-sm font-medium", isError ? "text-danger" : "text-fg")}>{issue.title}</div>
        <p className="mt-0.5 text-sm text-fg-secondary">{issue.message}</p>
      </div>
      <IconButton icon={X} label="Dismiss" size="sm" onClick={() => setIssue(null)} />
    </div>
  );
}