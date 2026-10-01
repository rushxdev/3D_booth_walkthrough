"use client";

import { Plus } from "lucide-react";
import { Section } from "./../ui/Section";
import { Row } from "./../ui/Row";
import { IconButton } from "./../ui/IconButton";
import { Button } from "./../ui/Button";

export function SidePanel() {
  return (
    <aside
      aria-label="Settings"
      className="w-(--panel-w) shrink-0 overflow-y-auto border-l border-line bg-surface-1"
    >
      <Section
        title="Screens"
        actions={<IconButton icon={Plus} label="Add screen" size="sm" tooltipSide="left" />}
      >
        <div className="rounded-md bg-accent-subtle px-2 py-1 text-sm text-accent-text">Screen 1 (selected)</div>
        <div className="rounded-md px-2 py-1 text-sm text-fg hover:bg-surface-2">Screen 2</div>
      </Section>
      <Section title="Content" defaultOpen={false}>
        <Row label="Type" htmlFor="t"><Button id="t">Video</Button></Row>
        <Row label="A very long label that truncates"><Button>Fit</Button></Row>
      </Section>
    </aside>
  );
}