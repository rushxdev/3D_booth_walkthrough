"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Box, Eye, FolderOpen, Footprints, Move3d, Orbit, Plus, Rotate3d, Trash2 } from "lucide-react";
import { TooltipProvider } from "./../../components/ui/Tooltip";
import { IconButton } from "./../../components/ui/IconButton";
import { Button } from "./../../components/ui/Button";
import { Section } from "./../../components/ui/Section";
import { Row } from "./../../components/ui/Row";
import { NumberField } from "./../../components/ui/NumberField";
import { Select } from "./../../components/ui/Select";
import { SegmentedControl } from "./../../components/ui/SegmentedControls";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-medium text-fg-secondary">{title}</h2>
      {children}
    </section>
  );
}

const swatches = [
  ["surface-0", "bg-surface-0"],
  ["surface-1", "bg-surface-1"],
  ["surface-2", "bg-surface-2"],
  ["line", "bg-line"],
  ["line-strong", "bg-line-strong"],
  ["accent", "bg-accent"],
  ["accent-subtle", "bg-accent-subtle"],
  ["danger", "bg-danger"],
] as const;

export function UiGallery() {
  const [tool, setTool] = useState("move");
  const [mode, setMode] = useState("overview");
  const [fit, setFit] = useState("contain");
  const [type, setType] = useState("video");
  const [x, setX] = useState(1.5);
  const [w, setW] = useState(3.2);
  const [bad, setBad] = useState(2);
  const [selected, setSelected] = useState(1);

  return (
    <TooltipProvider>
      <div className="h-full overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 p-6">
          <h1 className="text-base font-medium">UI primitives (dev only)</h1>
          <p className="text-fg-secondary">
            Hover, Tab and click everything. Hover and focus can&apos;t be shown statically.
          </p>

          <Group title="Tokens">
            <div className="flex flex-wrap gap-2">
              {swatches.map(([name, cls]) => (
                <div key={name} className="w-24">
                  <div className={`h-8 rounded-md border border-line-strong ${cls}`} />
                  <div className="mt-1 text-xs text-fg-secondary">{name}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <span className="text-fg">Primary text</span>
              <span className="text-fg-secondary">Secondary text</span>
              <span className="text-fg-disabled">Disabled text</span>
              <span className="text-accent-text">Accent text</span>
            </div>
          </Group>

          <Group title="Button">
            <div className="flex gap-2">
              <Button>Default</Button>
              <Button variant="primary">Primary</Button>
              <Button icon={Plus}>With icon</Button>
              <Button variant="primary" icon={Plus}>Add screen</Button>
              <Button disabled>Disabled</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </Group>

          <Group title="IconButton (default, active, disabled, small)">
            <div className="flex items-center gap-1">
              <IconButton icon={FolderOpen} label="Open model" shortcut="Ctrl O" />
              <IconButton icon={Box} label="Load sample" />
              <IconButton icon={Move3d} label="Active" active />
              <IconButton icon={Trash2} label="Disabled" disabled />
              <IconButton icon={Eye} label="Small" size="sm" />
            </div>
          </Group>

          <Group title="SegmentedControl">
            <div className="flex items-center gap-3">
              <SegmentedControl aria-label="Camera mode" value={mode} onValueChange={setMode} options={[
                { value: "overview", label: "Overview", icon: Orbit },
                { value: "walk", label: "Walk", icon: Footprints },
              ]} />
              <SegmentedControl aria-label="Gizmo tool" iconOnly value={tool} onValueChange={setTool} options={[
                { value: "move", label: "Move", icon: Move3d, shortcut: "W" },
                { value: "rotate", label: "Rotate", icon: Rotate3d, shortcut: "E" },
              ]} />
              <SegmentedControl aria-label="Disabled example" disabled value="a" onValueChange={() => {}} options={[
                { value: "a", label: "One" },
                { value: "b", label: "Two" },
              ]} />
            </div>
          </Group>

          <Group title="Docked panel (300px, as it will appear)">
            <div className="w-(--panel-w) border border-line bg-surface-1">
              <Section
                title="Screens"
                actions={<IconButton icon={Plus} label="Add screen" size="sm" tooltipSide="left" />}
              >
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSelected(n)}
                    className={`flex h-6 items-center rounded-md px-2 text-left text-sm transition-colors ${
                      selected === n ? "bg-accent-subtle text-accent-text" : "text-fg hover:bg-surface-2"
                    }`}
                  >
                    Screen {n}
                  </button>
                ))}
              </Section>

              <Section title="Transform">
                <Row label="Position X" htmlFor="g-x">
                  <NumberField id="g-x" value={x} onCommit={setX} unit="m" step={0.01} precision={3} min={-50} max={50} scrub />
                </Row>
                <Row label="Width" htmlFor="g-w">
                  <NumberField id="g-w" value={w} onCommit={setW} unit="m" step={0.1} min={0.1} max={50} scrub />
                </Row>
                <Row label="Invalid" htmlFor="g-bad">
                  <NumberField id="g-bad" value={bad} onCommit={setBad} unit="m" invalid />
                </Row>
                <Row label="Disabled" disabled>
                  <NumberField value={5} onCommit={() => {}} unit="px" disabled aria-label="Disabled example" />
                </Row>
                <Row label="A very long label that truncates">
                  <NumberField value={1} onCommit={() => {}} unit="°" aria-label="Long label example" />
                </Row>
              </Section>

              <Section title="Content">
                <Row label="Type" htmlFor="g-type">
                  <Select id="g-type" value={type} onValueChange={setType} options={[
                    { value: "none", label: "None" },
                    { value: "video", label: "Video" },
                    { value: "web", label: "Web page", disabled: true },
                  ]} />
                </Row>
                <Row label="Fit">
                  <SegmentedControl aria-label="Video fit" value={fit} onValueChange={setFit} options={[
                    { value: "contain", label: "Contain" },
                    { value: "cover", label: "Cover" },
                  ]} />
                </Row>
                <Row label="Disabled" disabled>
                  <Select value="none" onValueChange={() => {}} disabled options={[{ value: "none", label: "None" }]} aria-label="Disabled select" />
                </Row>
              </Section>

              <Section title="Collapsed by default" defaultOpen={false}>
                <Row label="Hidden row"><Button>Button</Button></Row>
              </Section>
            </div>
          </Group>
        </div>
      </div>
    </TooltipProvider>
  );
}