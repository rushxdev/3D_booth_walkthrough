let locker: (() => void) | null = null;

/** WalkController registers its lock() here so DOM overlays can call it inside a click handler. */
export function registerPointerLocker(fn: (() => void) | null): void {
  locker = fn;
}

/** Must run synchronously inside a user gesture, or the browser refuses. */
export function requestPointerLock(): void {
  locker?.();
}