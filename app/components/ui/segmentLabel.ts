type Segment = { label: string; disabled?: boolean; hint?: string };

/** The hint, but only while it explains something: an enabled option needs no excuse. */
export function segmentHint(o: Segment): string | undefined {
  return o.disabled && o.hint ? o.hint : undefined;
}

/** Tooltip and accessible name: "Walk: Load a model first" when disabled with a hint, else the label. */
export function segmentTooltip(o: Segment): string {
  const hint = segmentHint(o);
  return hint ? `${o.label}: ${hint}` : o.label;
}