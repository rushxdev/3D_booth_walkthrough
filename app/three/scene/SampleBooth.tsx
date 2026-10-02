import { useMemo, useEffect } from "react";
import { createSampleBooth } from "./createSampleBooth";
import { disposeObject } from "../loaders/dispose";

export function SampleBooth() {
  const booth = useMemo(() => createSampleBooth(), []);
  useEffect(() => () => disposeObject(booth), [booth]);
  return <primitive object={booth} />;
}