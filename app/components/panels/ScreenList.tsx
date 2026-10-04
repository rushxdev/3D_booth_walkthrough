"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "./../../components/ui/Button";
import { IconButton } from "./../../components/ui/IconButton";
import { Section } from "./../../components/ui/Section";
import { cn } from "./../../lib/cn";
import { MAX_NAME_LENGTH } from "./../../lib/schema";
import type { Screen } from "./../../lib/schema";
import { useSceneStore } from "./../../store/useSceneStore";
import { useScreenStore } from "./../../store/useScreenStore";
import { addScreenInView } from "./../../three/screens/addScreenInView";

function RenameInput({ initial, onCommit, onCancel }: { initial: string; onCommit: (v: string) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(initial);
  const inputRef = useRef<HTMLInputElement>(null);
  const done = useRef(false); // blur also fires after Enter/Esc; only finish once

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function finish(commit: boolean) {
    if (done.current) return;
    done.current = true;
    if (commit) onCommit(draft);
    else onCancel();
  }

  return (
    <input
      ref={inputRef}
      aria-label="Screen name"
      value={draft}
      maxLength={MAX_NAME_LENGTH}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          finish(true);
        } else if (e.key === "Escape") {
          e.preventDefault();
          finish(false);
        }
      }}
      onBlur={() => finish(true)}
      className="h-5 min-w-0 flex-1 rounded-sm border border-accent-text bg-surface-2 px-1 text-sm text-fg outline-none"
    />
  );
}

function ScreenRow({ screen, selected }: { screen: Screen; selected: boolean }) {
  const select = useScreenStore((s) => s.select);
  const update = useScreenStore((s) => s.update);
  const remove = useScreenStore((s) => s.remove);
  const [renaming, setRenaming] = useState(false);

  return (
    <li className={cn("flex h-7 items-center gap-0.5 rounded-md pr-0.5 pl-1 transition-colors", selected ? "bg-accent-subtle" : "hover:bg-surface-2")}>
      {renaming ? (
        <RenameInput
          initial={screen.name}
          onCommit={(name) => {
            update(screen.id, { name });
            setRenaming(false);
          }}
          onCancel={() => setRenaming(false)}
        />
      ) : (
        <button
          type="button"
          aria-current={selected || undefined}
          title="Double-click or press F2 to rename"
          onClick={() => select(screen.id)}
          onDoubleClick={() => setRenaming(true)}
          onKeyDown={(e) => {
            if (e.key === "F2") {
              e.preventDefault();
              setRenaming(true);
            }
          }}
          className={cn(
            "flex h-full min-w-0 flex-1 items-center rounded-sm text-left text-sm",
            selected ? "text-accent-text" : screen.visible ? "text-fg" : "text-fg-disabled",
          )}
        >
          <span className="truncate">{screen.name}</span>
        </button>
      )}
      <IconButton
        icon={screen.visible ? Eye : EyeOff}
        label={screen.visible ? "Hide screen" : "Show screen"}
        size="sm"
        onClick={() => update(screen.id, { visible: !screen.visible })}
      />
      <IconButton icon={Trash2} label="Delete screen" shortcut="Del" size="sm" onClick={() => remove(screen.id)} />
    </li>
  );
}

export function ScreenList() {
  const screens = useScreenStore((s) => s.screens);
  const selectedId = useScreenStore((s) => s.selectedId);
  const duplicate = useScreenStore((s) => s.duplicate);
  const hasModel = useSceneStore((s) => s.model !== null);

  return (
    <Section
      title={screens.length > 0 ? `Screens (${screens.length})` : "Screens"}
      actions={
        <>
          <IconButton
            icon={Copy}
            label="Duplicate screen"
            shortcut="Ctrl D"
            size="sm"
            tooltipSide="left"
            disabled={selectedId === null}
            onClick={() => selectedId && duplicate(selectedId)}
          />
          <IconButton
            icon={Plus}
            label={hasModel ? "Add screen" : "Add screen (load a model first)"}
            size="sm"
            tooltipSide="left"
            disabled={!hasModel}
            onClick={addScreenInView}
          />
        </>
      }
    >
      {screens.length === 0 ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm text-fg-secondary">No screens yet.</p>
          <Button icon={Plus} disabled={!hasModel} onClick={addScreenInView}>
            Add screen
          </Button>
        </div>
      ) : (
        <ul aria-label="Screens" className="flex flex-col gap-px">
          {screens.map((s) => (
            <ScreenRow key={s.id} screen={s} selected={s.id === selectedId} />
          ))}
        </ul>
      )}
    </Section>
  );
}