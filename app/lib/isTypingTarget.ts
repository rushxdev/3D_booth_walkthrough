type ElementLike = { tagName?: string; isContentEditable?: boolean } | null;
const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/** True when a keystroke belongs to a text field, so global shortcuts must not fire. */
export function isTypingTarget(el: ElementLike): boolean {
  if (!el) return false;
  return Boolean(el.isContentEditable) || TYPING_TAGS.has(el.tagName ?? "");
}