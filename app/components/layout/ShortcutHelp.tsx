"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { IconButton } from "./../ui/IconButton";
import { shortcutGroups } from "@/app/shortcuts/shortcutList";
import { usePresenting } from "@/app/presentation/usePresenting";
import { useHelpStore } from "@/app/store/useHelpStore";
import { useUiStore } from "@/app/store/useUiStore";

export function ShortcutHelp() {
  const open = useHelpStore((s) => s.open);
  const close = useHelpStore((s) => s.close);
  const mode = useUiStore((s) => s.mode);
  const locked = useUiStore((s) => s.walkLocked);
  const presenting = usePresenting();
  const panel = useRef<HTMLDivElement>(null);

  // Move focus in, and give it back to whatever had it when the list closes.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    return () => opener?.focus?.();
  }, [open]);

  // With the pointer locked the list could be neither read nor closed.
  useEffect(() => {
    if (locked) close();
  }, [locked, close]);

  if (!open) return null;

  return (
    <div
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-label="Keyboard shortcuts"
      className="fixed top-12 left-3 z-30 max-h-[calc(100%-4rem)] w-72 overflow-y-auto rounded-md border border-line-strong bg-surface-1 text-sm"
    >
      <div className="flex h-8 items-center justify-between border-b border-line pr-1 pl-3">
        <span className="font-medium text-fg">Keyboard shortcuts</span>
        <IconButton icon={X} label="Close" shortcut="Esc" size="sm" onClick={close} />
      </div>
      <div className="flex flex-col gap-3 p-3">
        {shortcutGroups({ mode, presenting }).map((group) => (
          <section key={group.title} aria-label={group.title}>
            <h2 className="mb-1 text-xs font-medium text-fg-secondary">{group.title}</h2>
            <ul className="flex flex-col gap-1">
              {group.items.map((it) => (
                <li key={it.keys.join("+")} className="flex items-center justify-between gap-3">
                  <span className="text-fg-secondary">{it.action}</span>
                  <span className="flex shrink-0 gap-1">
                    {it.keys.map((k) => (
                      <kbd key={k} className="rounded-sm border border-line-strong bg-surface-2 px-1 text-xs text-fg">
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}