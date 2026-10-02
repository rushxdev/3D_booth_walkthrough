"use client";

import type { ReactNode } from "react";
import { Row } from "./../../components/ui/Row";
import { Section } from "./../../components/ui/Section";
import { Select } from "./../../components/ui/Select";
import { formatBytes } from "./../../lib/format";
import { UNITS, UNIT_LABELS, isUnit } from "./../../lib/units";
import type { Unit } from "./../../lib/units";
import { useSceneStore } from "./../../store/useSceneStore";
import type { ModelSource } from "./../../store/useSceneStore";
import { placementFor } from "./../../three/loaders/normalize";

function Value({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span title={title} className="tabular min-w-0 truncate text-right text-sm text-fg">
      {children}
    </span>
  );
}

const UNIT_OPTIONS = UNITS.map((u) => ({ value: u, label: UNIT_LABELS[u] }));

function FileRows({ model, onUnit }: { model: Extract<ModelSource, { kind: "file" }>; onUnit: (u: Unit) => void }) {
  const [w, h, d] = placementFor(model.measure.min, model.measure.max, model.unit).size;
  return (
    <>
      <Row label="Name"><Value title={model.name}>{model.name}</Value></Row>
      <Row label="File size"><Value>{formatBytes(model.size)}</Value></Row>
      <Row label="Dimensions">
        <Value title="Width x Height x Depth">{`${w.toFixed(2)} × ${h.toFixed(2)} × ${d.toFixed(2)} m`}</Value>
      </Row>
      <Row label="Triangles"><Value>{Math.round(model.measure.triangleCount).toLocaleString()}</Value></Row>
      <Row label="Meshes"><Value>{model.measure.meshCount.toLocaleString()}</Value></Row>
      <Row label="Model units" htmlFor="model-unit">
        <Select
          id="model-unit"
          value={model.unit}
          onValueChange={(v) => isUnit(v) && onUnit(v)}
          options={UNIT_OPTIONS}
        />
      </Row>
      {model.unit !== model.detectedUnit && (
        <p className="text-xs text-fg-secondary">Auto-detected: {UNIT_LABELS[model.detectedUnit]}</p>
      )}
    </>
  );
}

export function ModelInfo() {
  const model = useSceneStore((s) => s.model);
  const setModelUnit = useSceneStore((s) => s.setModelUnit);

  return (
    <Section title="Model">
      {!model && <p className="text-sm text-fg-secondary">No model loaded.</p>}
      {model?.kind === "sample" && (
        <>
          <Row label="Name"><Value>Sample booth</Value></Row>
          <p className="text-xs text-fg-secondary">Built-in sample, modeled in meters.</p>
        </>
      )}
      {model?.kind === "file" && <FileRows model={model} onUnit={setModelUnit} />}
    </Section>
  );
}