"use client";

import { NumberField } from "./../../components/ui/NumberField";
import { Row } from "./../../components/ui/Row";
import { Section } from "./../../components/ui/Section";
import { LOOK_SENSITIVITY_RANGE, WALK_SPEED_RANGE, useUiStore } from "./../../store/useUiStore";
import { RUN_MULTIPLIER } from "./../../three/controls/movement";

export function WalkSettings() {
  const walkSpeed = useUiStore((s) => s.walkSpeed);
  const lookSensitivity = useUiStore((s) => s.lookSensitivity);
  const setWalkSpeed = useUiStore((s) => s.setWalkSpeed);
  const setLookSensitivity = useUiStore((s) => s.setLookSensitivity);

  return (
    <Section title="Walk settings">
      <Row label="Walk speed" htmlFor="walk-speed">
        <NumberField id="walk-speed" value={walkSpeed} onCommit={setWalkSpeed} unit="m/s" step={0.1} precision={1} min={WALK_SPEED_RANGE.min} max={WALK_SPEED_RANGE.max} scrub />
      </Row>
      <Row label="Sensitivity" htmlFor="look-sensitivity">
        <NumberField id="look-sensitivity" value={lookSensitivity} onCommit={setLookSensitivity} unit="×" step={0.1} precision={1} min={LOOK_SENSITIVITY_RANGE.min} max={LOOK_SENSITIVITY_RANGE.max} scrub />
      </Row>
      <p className="text-xs text-fg-secondary">Hold Shift to run at {RUN_MULTIPLIER}× speed.</p>
    </Section>
  );
}