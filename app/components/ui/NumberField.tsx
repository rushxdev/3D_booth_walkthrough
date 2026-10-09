"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { cn } from "./../../lib/cn";
import { clamp, formatNumber, parseNumber, roundTo } from "./../../lib/number";
import { spokenValue } from "./../../lib/a11y"

type NumberFieldProps = {
  value: number;
  onCommit: (value: number) => void;
  id?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;       // arrow-key and scrub increment
  precision?: number;  // decimals kept
  scrub?: boolean;     // drag the unit suffix to change the value
  disabled?: boolean;
  invalid?: boolean;
  "aria-label"?: string;
  className?: string;
};

export function NumberField({
  value,
  onCommit,
  id,
  unit,
  min,
  max,
  step = 1,
  precision = 2,
  scrub = false,
  disabled = false,
  invalid = false,
  className,
  ...aria
}: NumberFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scrubRef = useRef<{ x: number; v: number } | null>(null);
  const [draft, setDraft] = useState<string | null>(null); // null = not editing
  const [rejected, setRejected] = useState(false);

  const display = draft ?? formatNumber(value, precision);
  const showInvalid = invalid || rejected;

  /** Round, clamp, and report only real changes. */
  function apply(n: number) {
    const next = clamp(roundTo(n, precision), min, max);
    if (next !== value) onCommit(next);
  }

  function selectAllSoon() {
    requestAnimationFrame(() => inputRef.current?.select());
  }

  /** Returns false if the draft is not a number (nothing is committed). */
  function commitDraft(): boolean {
    if (draft === null) return true;
    const n = parseNumber(draft);
    if (n === null) {
      setRejected(true);
      return false;
    }
    apply(n);
    setDraft(null);
    setRejected(false);
    return true;
  }

  function revert() {
    setDraft(null);
    setRejected(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (commitDraft()) selectAllSoon();
        break;
      case "Escape":
        if (draft !== null || rejected) {
          e.preventDefault();
          revert();
          selectAllSoon();
        } else {
          inputRef.current?.blur(); // nothing to revert: leave the field
        }
        break;
      case "ArrowUp":
      case "ArrowDown": {
        e.preventDefault();
        const dir = e.key === "ArrowUp" ? 1 : -1;
        const mult = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
        const typed = draft !== null ? parseNumber(draft) : null;
        const base = typed ?? (Number.isFinite(value) ? value : 0);
        apply(base + dir * step * mult);
        revert();
        selectAllSoon();
        break;
      }
    }
  }

  function onBlur() {
    if (!commitDraft()) revert(); // invalid text on blur: revert silently
  }

  // Drag-to-scrub on the unit suffix: 1 px = one step (Shift x10, Alt x0.1)
  function onScrubDown(e: PointerEvent<HTMLSpanElement>) {
    if (!scrub || disabled) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubRef.current = { x: e.clientX, v: Number.isFinite(value) ? value : 0 };
  }
  function onScrubMove(e: PointerEvent<HTMLSpanElement>) {
    const s = scrubRef.current;
    if (!s) return;
    const mult = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
    apply(s.v + (e.clientX - s.x) * step * mult);
  }
  function onScrubUp(e: PointerEvent<HTMLSpanElement>) {
    scrubRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  return (
    <div
      className={cn(
        "flex h-(--control-h) w-28 items-center rounded-md border bg-surface-2 transition-colors",
        disabled
          ? "border-line text-fg-disabled"
          : showInvalid
            ? "border-danger"
            : "border-line not-focus-within:hover:border-line-strong focus-within:border-accent-text",
        className,
      )}
    >
      <input
        ref={inputRef}
        id={id}
        role="spinbutton"
        aria-valuenow={Number.isFinite(value) ? value : undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={spokenValue(value, precision, unit)}
        aria-invalid={showInvalid || undefined}
        value={display}
        onChange={(e) => {
          setDraft(e.target.value);
          setRejected(false);
        }}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="tabular min-w-0 flex-1 bg-transparent px-2 text-sm text-fg outline-none disabled:cursor-default disabled:text-fg-disabled"
        {...aria}
      />
      {unit && (
        <span
          aria-hidden
          onPointerDown={onScrubDown}
          onPointerMove={onScrubMove}
          onPointerUp={onScrubUp}
          onPointerCancel={onScrubUp}
          className={cn(
            "select-none pr-2 pl-1 text-xs",
            disabled ? "text-fg-disabled" : "text-fg-secondary",
            scrub && !disabled && "cursor-ew-resize hover:text-fg",
          )}
        >
          {unit}
        </span>
      )}
    </div>
  );
}