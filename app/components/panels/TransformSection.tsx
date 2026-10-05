"use client";

import { Link, Lock, Unlink, Unlock } from "lucide-react";
import { IconButton } from "./../../components/ui/IconButton";
import { NumberField } from "./../../components/ui/NumberField";
import { Row } from "./../../components/ui/Row";
import { Section } from "./../../components/ui/Section";
import { Select } from "./../../components/ui/Select";
import { Value } from "./../../components/ui/Value";
import { POSITION_RANGE, RESOLUTION_RANGE, SCREEN_SIZE_RANGE } from "./../../lib/schema";
import type { Screen, Vec3 } from "./../../lib/schema";
import {
  ASPECT_PRESETS,
  applyHeight,
  applyWidth,
  degToRad,
  diagonalInches,
  matchPreset,
  pixelDensity,
  pixelPitchMm,
  radToDeg,
  resizeToAspect,
  wrapDegrees,
} from "./../../lib/screenMath";
import { useScreenStore } from "./../../store/useScreenStore";
import { useUiStore } from "./../../store/useUiStore";

const AXES = ["X", "Y", "Z"] as const;

function useSelectedScreen(): Screen | undefined {
  return useScreenStore((s) => s.screens.find((x) => x.id === s.selectedId));
}

export function TransformSection() {
  const screen = useSelectedScreen();
  const update = useScreenStore((s) => s.update);
  if (!screen) return null;

  const setPosition = (axis: number, value: number) => {
    const next = [...screen.position] as Vec3;
    next[axis] = value;
    update(screen.id, { position: next });
  };
  const setRotation = (axis: number, degrees: number) => {
    const next = [...screen.rotation] as Vec3;
    next[axis] = degToRad(degrees);
    update(screen.id, { rotation: next });
  };

  return (
    <Section
      title="Transform"
      actions={
        <IconButton
          icon={screen.locked ? Lock : Unlock}
          label={screen.locked ? "Unlock screen" : "Lock screen"}
          size="sm"
          tooltipSide="left"
          active={screen.locked}
          onClick={() => update(screen.id, { locked: !screen.locked })}
        />
      }
    >
      {screen.locked && <p className="text-xs text-fg-secondary">Locked. Unlock to edit.</p>}
      {AXES.map((axis, i) => (
        <Row key={`pos-${axis}`} label={`Position ${axis}`} htmlFor={`pos-${axis}`}>
          <NumberField
            id={`pos-${axis}`}
            value={screen.position[i]}
            onCommit={(v) => setPosition(i, v)}
            unit="m"
            step={0.01}
            precision={3}
            min={POSITION_RANGE.min}
            max={POSITION_RANGE.max}
            disabled={screen.locked}
            scrub
          />
        </Row>
      ))}
      {AXES.map((axis, i) => (
        <Row key={`rot-${axis}`} label={`Rotation ${axis}`} htmlFor={`rot-${axis}`}>
          <NumberField
            id={`rot-${axis}`}
            value={wrapDegrees(radToDeg(screen.rotation[i]))}
            onCommit={(v) => setRotation(i, v)}
            unit="°"
            step={1}
            precision={1}
            min={-360}
            max={360}
            disabled={screen.locked}
            scrub
          />
        </Row>
      ))}
    </Section>
  );
}

export function SizeSection() {
  const screen = useSelectedScreen();
  const update = useScreenStore((s) => s.update);
  const lockAspect = useUiStore((s) => s.lockAspect);
  const setLockAspect = useUiStore((s) => s.setLockAspect);
  if (!screen) return null;

  const size = { width: screen.width, height: screen.height };
  const preset = matchPreset(size.width, size.height);

  const onPreset = (id: string) => {
    const chosen = ASPECT_PRESETS.find((p) => p.id === id);
    if (chosen) update(screen.id, resizeToAspect(size, chosen.ratio, "diagonal"));
  };

  return (
    <Section title="Size">
      <Row label="Aspect" htmlFor="aspect-preset">
        <Select
          id="aspect-preset"
          value={preset ?? "custom"}
          onValueChange={onPreset}
          disabled={screen.locked}
          options={[
            ...ASPECT_PRESETS.map((p) => ({ value: p.id, label: p.label })),
            { value: "custom", label: "Custom", disabled: true },
          ]}
        />
        <IconButton
          icon={lockAspect ? Link : Unlink}
          label="Lock aspect ratio"
          size="sm"
          tooltipSide="left"
          active={lockAspect}
          onClick={() => setLockAspect(!lockAspect)}
        />
      </Row>
      <Row label="Width" htmlFor="size-width">
        <NumberField
          id="size-width"
          value={screen.width}
          onCommit={(v) => update(screen.id, applyWidth(size, v, lockAspect))}
          unit="m"
          step={0.01}
          precision={3}
          min={SCREEN_SIZE_RANGE.min}
          max={SCREEN_SIZE_RANGE.max}
          disabled={screen.locked}
          scrub
        />
      </Row>
      <Row label="Height" htmlFor="size-height">
        <NumberField
          id="size-height"
          value={screen.height}
          onCommit={(v) => update(screen.id, applyHeight(size, v, lockAspect))}
          unit="m"
          step={0.01}
          precision={3}
          min={SCREEN_SIZE_RANGE.min}
          max={SCREEN_SIZE_RANGE.max}
          disabled={screen.locked}
          scrub
        />
      </Row>
      <Row label="Diagonal">
        <Value>{diagonalInches(screen.width, screen.height).toFixed(1)} in</Value>
      </Row>
      <Row label="Resolution W" htmlFor="res-width">
        <NumberField
          id="res-width"
          value={screen.resolution[0]}
          onCommit={(v) => update(screen.id, { resolution: [v, screen.resolution[1]] })}
          unit="px"
          step={1}
          precision={0}
          min={RESOLUTION_RANGE.min}
          max={RESOLUTION_RANGE.max}
          disabled={screen.locked}
        />
      </Row>
      <Row label="Resolution H" htmlFor="res-height">
        <NumberField
          id="res-height"
          value={screen.resolution[1]}
          onCommit={(v) => update(screen.id, { resolution: [screen.resolution[0], v] })}
          unit="px"
          step={1}
          precision={0}
          min={RESOLUTION_RANGE.min}
          max={RESOLUTION_RANGE.max}
          disabled={screen.locked}
        />
      </Row>
      <Row label="Pixel density">
        <Value>{Math.round(pixelDensity(screen.resolution[0], screen.width)).toLocaleString()} px/m</Value>
      </Row>
      <Row label="Pixel pitch">
        <Value>{pixelPitchMm(screen.resolution[0], screen.width).toFixed(2)} mm</Value>
      </Row>
    </Section>
  );
}