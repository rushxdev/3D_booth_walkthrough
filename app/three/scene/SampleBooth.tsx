import { useMemo } from "react";
import { createSampleBooth } from "./createSampleBooth";

export function SampleBooth() {
  const booth = useMemo(() => createSampleBooth(), []);
  return <primitive object={booth} />;
}