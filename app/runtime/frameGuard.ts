export type FrameGuardOptions = {
  /** Consecutive failing frames before the fault is reported. */
  threshold?: number;
  onFault: (source: string, error: unknown) => void;
  log?: (label: string, error: unknown) => void;
};

export const FRAME_FAULT_THRESHOLD = 3;

/**
 * Runs per-frame code so that it can never throw into the render loop.
 * A failure is logged once per streak; `threshold` failures in a row are reported once,
 * after which the guard stops running the code.
 */
export function createFrameGuard(source: string, options: FrameGuardOptions) {
  const threshold = options.threshold ?? FRAME_FAULT_THRESHOLD;
  const log = options.log ?? ((label: string, error: unknown) => console.error(label, error));
  let streak = 0;
  let reported = false;

  return function run(fn: () => void): void {
    if (reported) return;
    try {
      fn();
      streak = 0;
    } catch (error) {
      streak += 1;
      if (streak === 1) log(`[frame:${source}]`, error);
      if (streak >= threshold) {
        reported = true;
        options.onFault(source, error);
      }
    }
  };
}