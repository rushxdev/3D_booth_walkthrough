export type ContextHandlers = {
  onLost: () => void;
  onRestored: () => void;
  /** The context was lost and did not come back in time. */
  onTimeout: () => void;
};

export const RESTORE_TIMEOUT_MS = 4000;

/** Listens for WebGL context loss on a canvas. Returns the cleanup function. */
export function watchContext(
  target: EventTarget,
  handlers: ContextHandlers,
  timeoutMs = RESTORE_TIMEOUT_MS,
): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clear = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };

  const lost = (e: Event) => {
    e.preventDefault(); // without this the browser never tries to restore it
    handlers.onLost();
    clear();
    timer = setTimeout(handlers.onTimeout, timeoutMs);
  };
  const restored = () => {
    clear();
    handlers.onRestored();
  };

  target.addEventListener("webglcontextlost", lost);
  target.addEventListener("webglcontextrestored", restored);
  return () => {
    clear();
    target.removeEventListener("webglcontextlost", lost);
    target.removeEventListener("webglcontextrestored", restored);
  };
}