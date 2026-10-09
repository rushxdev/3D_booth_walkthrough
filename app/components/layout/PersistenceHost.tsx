"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./../../components/ui/Button";
import { IconButton } from "./../../components/ui/IconButton";
import { usePersistenceStore } from "@/app/store/usePersistenceStore";
import { exportSetup, startPersistence } from "@/app/persistence/session";
import { usePresenting } from "@/app/presentation/usePresenting";

const NOTICE_MS = 6000;

/** Starts autosave and restore, and shows the storage-error and restore strip. */
export function PersistenceHost() {
  const saveState = usePersistenceStore((s) => s.saveState);
  const errorMessage = usePersistenceStore((s) => s.errorMessage);
  const paused = usePersistenceStore((s) => s.savingPaused);
  const notice = usePersistenceStore((s) => s.notice);
  const setNotice = usePersistenceStore((s) => s.setNotice);
  const pauseSaving = usePersistenceStore((s) => s.pauseSaving);
  const presenting = usePresenting();

  useEffect(() => startPersistence(), []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(t);
  }, [notice, setNotice]);

  const isError = saveState === "error" && !paused && !!errorMessage;
  const text = isError ? errorMessage : notice;
  if (presenting || !text) return null;

  return (
    <div
      role={isError ? "alert" : "status"}
      className="flex shrink-0 items-center gap-2 border-b border-line bg-surface-1 px-3 py-1 text-xs"
    >
      <span className={isError ? "text-danger-text" : "text-fg-secondary"}>{text}</span>
      <div className="flex-1" />
      {isError ? (
        <>
          <Button onClick={exportSetup}>Export setup</Button>
          <Button onClick={pauseSaving}>Continue without saving</Button>
        </>
      ) : (
        <IconButton icon={X} label="Dismiss" onClick={() => setNotice(null)} />
      )}
    </div>
  );
}