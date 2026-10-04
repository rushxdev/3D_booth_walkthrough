export type WalkAction = "forward" | "back" | "left" | "right" | "run";
export type WalkInputState = Record<WalkAction, boolean>;

// KeyboardEvent.code is the physical key, so WASD stays under the left hand on AZERTY etc.
const ACTION_KEYS: Record<WalkAction, readonly string[]> = {
  forward: ["KeyW", "ArrowUp"],
  back: ["KeyS", "ArrowDown"],
  left: ["KeyA", "ArrowLeft"],
  right: ["KeyD", "ArrowRight"],
  run: ["ShiftLeft", "ShiftRight"],
};
const HANDLED = new Set(Object.values(ACTION_KEYS).flat());

/** An action is active while any of its keys is held (so W + ArrowUp don't cancel each other). */
export function deriveState(pressed: ReadonlySet<string>): WalkInputState {
  const has = (a: WalkAction) => ACTION_KEYS[a].some((code) => pressed.has(code));
  return { forward: has("forward"), back: has("back"), left: has("left"), right: has("right"), run: has("run") };
}

export function createWalkInput() {
  const pressed = new Set<string>();
  const state: WalkInputState = deriveState(pressed);
  const sync = () => Object.assign(state, deriveState(pressed));
  const reset = () => {
    pressed.clear();
    sync();
  };

  return {
    state,
    reset,
    /** `isActive` gates keydown, so arrow keys still work normally on focused UI when not walking. */
    attach(target: EventTarget, isActive: () => boolean): () => void {
      const onDown = (ev: Event) => {
        const e = ev as KeyboardEvent;
        if (!isActive() || e.ctrlKey || e.metaKey || e.altKey || !HANDLED.has(e.code)) return;
        e.preventDefault();
        pressed.add(e.code);
        sync();
      };
      const onUp = (ev: Event) => {
        pressed.delete((ev as KeyboardEvent).code); // always, so keys never stick
        sync();
      };
      target.addEventListener("keydown", onDown);
      target.addEventListener("keyup", onUp);
      target.addEventListener("blur", reset);
      return () => {
        target.removeEventListener("keydown", onDown);
        target.removeEventListener("keyup", onUp);
        target.removeEventListener("blur", reset);
        reset();
      };
    },
  };
}

/** One canvas, one walker: a module-level instance keeps input outside React. */
export const walkInput = createWalkInput();