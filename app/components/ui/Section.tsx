"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type SectionProps = {
  title: string;
  defaultOpen?: boolean;
  actions?: ReactNode; // header-right controls, e.g. an "Add" IconButton
  children: ReactNode;
};

export function Section({ title, defaultOpen = true, actions, children }: SectionProps) {
  return (
    <Collapsible.Root defaultOpen={defaultOpen} className="group/section border-b border-line">
      <div className="flex h-8 items-center pr-2">
        <Collapsible.Trigger className="flex h-full min-w-0 flex-1 items-center gap-1 rounded-sm pl-2 text-left text-xs font-medium text-fg-secondary transition-colors hover:text-fg">
          <ChevronRight
            size={14}
            strokeWidth={1.75}
            aria-hidden
            className="shrink-0 group-data-[state=open]/section:rotate-90"
          />
          <span className="truncate">{title}</span>
        </Collapsible.Trigger>
        {actions && <div className="flex shrink-0 items-center gap-0.5">{actions}</div>}
      </div>
      <Collapsible.Content>
        <div className="flex flex-col gap-1 px-3 pb-3">{children}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}