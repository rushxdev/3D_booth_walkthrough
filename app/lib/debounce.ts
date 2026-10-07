export type Debounced<A extends unknown[]> = ((...args: A) => void) & {
  /** Runs the pending call now, if there is one. */
  flush: () => void;
  /** Drops the pending call. */
  cancel: () => void;
  hasPending: () => boolean;
};

export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | null = null;

  const run = () => {
    timer = undefined;
    if (!pending) return;
    const args = pending;
    pending = null;
    fn(...args);
  };

  const debounced = (...args: A) => {
    pending = args;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(run, ms);
  };

  return Object.assign(debounced, {
    flush: () => {
      if (timer === undefined) return;
      clearTimeout(timer);
      run();
    },
    cancel: () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      pending = null;
    },
    hasPending: () => pending !== null,
  });
}