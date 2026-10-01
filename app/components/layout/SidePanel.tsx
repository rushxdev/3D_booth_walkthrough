"use client";

import { Footprints, Move3d, Orbit, Plus, Rotate3d } from "lucide-react";
import { Section } from "./../ui/Section";
import { Row } from "./../ui/Row";
import { IconButton } from "./../ui/IconButton";
import { Button } from "./../ui/Button";
import { useState } from "react";
import { NumberField } from "../ui/NumberField";
import { Select } from "../ui/Select";
import { SegmentedControl } from "../ui/SegmentedControls";

export function SidePanel() {
  const [x, setX] = useState(1.5);
  const [rot, setRot] = useState(0);
  const [w, setW] = useState(3.2);
  
  const [type, setType] = useState("none");
  const [fit, setFit] = useState("contain");
  const [mode, setMode] = useState("overview");
  const [tool, setTool] = useState("move");
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
      <Section title="Transform">
        <Row label="Position X" htmlFor="px"><NumberField id="px" value={x} onCommit={setX} unit="m" step={0.01} precision={3} min={-50} max={50} scrub /></Row>
        <Row label="Rotation Y" htmlFor="ry"><NumberField id="ry" value={rot} onCommit={setRot} unit="°" step={1} precision={1} min={-180} max={180} scrub /></Row>
        <Row label="Width" htmlFor="w"><NumberField id="w" value={w} onCommit={setW} unit="m" step={0.1} precision={2} min={0.1} max={50} scrub /></Row>
        <Row label="Disabled"><NumberField value={5} onCommit={() => {}} unit="px" disabled aria-label="Disabled example" /></Row>
      </Section>
      <Section title="Content">
        <Row label="Type" htmlFor="ct">
          <Select id="ct" value={type} onValueChange={setType} options={[
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
        <Row label="Mode">
          <SegmentedControl aria-label="Camera mode" value={mode} onValueChange={setMode} options={[
            { value: "overview", label: "Overview", icon: Orbit },
            { value: "walk", label: "Walk", icon: Footprints },
          ]} />
        </Row>
        <Row label="Tool">
          <SegmentedControl aria-label="Gizmo tool" iconOnly value={tool} onValueChange={setTool} options={[
            { value: "move", label: "Move", icon: Move3d, shortcut: "W" },
            { value: "rotate", label: "Rotate", icon: Rotate3d, shortcut: "E" },
          ]} />
        </Row>
        <Row label="Disabled"><Select value="none" onValueChange={() => {}} disabled options={[{ value: "none", label: "None" }]} /></Row>
      </Section>
    </aside>
  );
}