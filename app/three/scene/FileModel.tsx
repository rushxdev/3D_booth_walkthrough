import { useMemo } from "react";
import type { Group } from "three";
import type { Unit } from "./../../lib/units";
import { placementFor } from "../loaders/normalize";
import type { ModelMeasure } from "../loaders/normalize";

type FileModelProps = { scene: Group; measure: ModelMeasure; unit: Unit };

export function FileModel({ scene, measure, unit }: FileModelProps) {
  const placement = useMemo(() => placementFor(measure.min, measure.max, unit), [measure, unit]);
  return <primitive object={scene} scale={placement.scale} position={placement.position} />;
}