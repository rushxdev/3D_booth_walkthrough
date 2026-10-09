export type PresentationKeyEvent = {
  code: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  repeat?: boolean;
};

export type PresentationKeyAction = "toggle-presentation" | "toggle-view" | null;

/**
 * The keys that exist because of presentation mode. Everything else stays in Shortcuts.
 * P works in any mode that has a model; V only while presenting.
 */
export function presentationKeyAction(
  e: PresentationKeyEvent,
  ctx: { presenting: boolean; hasModel: boolean },
): PresentationKeyAction {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return null; // Ctrl+P is the browser's print
  if (e.code === "KeyP") return ctx.presenting || ctx.hasModel ? "toggle-presentation" : null;
  if (e.code === "KeyV") return ctx.presenting && ctx.hasModel ? "toggle-view" : null;
  return null;
}