export type ErrorDescription = { title: string; detail: string; technical: string; webgl: boolean };

export function resetKeysChanged(prev?: readonly unknown[], next?: readonly unknown[]): boolean {
  if (!prev || !next) return prev !== next;
  return prev.length !== next.length || prev.some((v, i) => !Object.is(v, next[i]));
}

/** Turns anything that was thrown into text a person can act on. Never throws. */
export function describeRenderError(error: unknown): ErrorDescription {
  let message = "";
  try {
    message = error instanceof Error ? error.message : String(error);
  } catch {
    /* an object whose toString throws */
  }
  const technical = message.slice(0, 200);
  const webgl = /webgl|gpu|graphics context/i.test(message);

  return webgl
    ? {
        title: "3D graphics are not available",
        detail: "This browser could not start WebGL. Check that hardware acceleration is on, or try another browser.",
        technical,
        webgl,
      }
    : {
        title: "The viewport hit an error",
        detail: "Your screens and setup are saved. Reload the scene to continue.",
        technical,
        webgl,
      };
}