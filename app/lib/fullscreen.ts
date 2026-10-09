type FullscreenDoc = {
  fullscreenEnabled?: boolean;
  fullscreenElement: Element | null;
  exitFullscreen?: () => Promise<void>;
  documentElement: { requestFullscreen?: (options?: FullscreenOptions) => Promise<void> };
};

export type FullscreenResult = { ok: true } | { ok: false; reason: "unsupported" | "denied" };

const defaultDoc = (): FullscreenDoc | null => (typeof document === "undefined" ? null : document);

export function fullscreenSupported(doc: FullscreenDoc | null = defaultDoc()): boolean {
  return !!doc && !!doc.fullscreenEnabled && typeof doc.documentElement.requestFullscreen === "function";
}

/** Never throws. Browsers deny it without a user gesture; that is a result, not an error. */
export async function enterFullscreen(doc: FullscreenDoc | null = defaultDoc()): Promise<FullscreenResult> {
  if (!doc || !fullscreenSupported(doc)) return { ok: false, reason: "unsupported" };
  if (doc.fullscreenElement) return { ok: true };
  try {
    await doc.documentElement.requestFullscreen!();
    return { ok: true };
  } catch {
    return { ok: false, reason: "denied" };
  }
}

export async function exitFullscreen(doc: FullscreenDoc | null = defaultDoc()): Promise<FullscreenResult> {
  if (!doc || !doc.fullscreenElement) return { ok: true };
  if (!doc.exitFullscreen) return { ok: false, reason: "unsupported" };
  try {
    await doc.exitFullscreen();
    return { ok: true };
  } catch {
    return { ok: false, reason: "denied" };
  }
}