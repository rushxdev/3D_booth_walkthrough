"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "./../../lib/cn";

export type SelectOption = { value: string; label: string; disabled?: boolean };

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
};

export function Select({
  value,
  onValueChange,
  options,
  id,
  placeholder,
  disabled = false,
  className,
  ...aria
}: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        id={id}
        {...aria}
        className={cn(
          "group flex h-(--control-h) w-full min-w-0 items-center justify-between gap-1 rounded-md border border-line bg-surface-2 px-2 text-sm text-fg outline-none transition-colors",
          "hover:border-line-strong focus-visible:border-accent-text data-[state=open]:border-accent-text",
          "data-disabled:pointer-events-none data-disabled:text-fg-disabled data-placeholder:text-fg-secondary",
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} className="truncate" />
        <RadixSelect.Icon asChild>
          <ChevronDown size={14} strokeWidth={1.75} aria-hidden className="shrink-0 text-fg-secondary group-data-disabled:text-fg-disabled" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden rounded-md border border-line-strong bg-surface-2"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((o) => (
              <RadixSelect.Item
                key={o.value}
                value={o.value}
                disabled={o.disabled}
                className="relative flex h-6 cursor-default select-none items-center rounded-sm pr-6 pl-2 text-sm text-fg outline-none data-disabled:text-fg-disabled data-highlighted:bg-line"
              >
                <RadixSelect.ItemText>{o.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="absolute right-1.5">
                  <Check size={12} strokeWidth={2} aria-hidden className="text-accent-text" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}