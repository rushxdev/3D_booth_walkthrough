import type { SceneSetup, Screen } from "./schema";
import { summarizeSetup } from "./setupFile";

/** Unique video ids used by these screens. */
export function videoSrcsOf(screens: readonly Pick<Screen, "content">[]): string[] {
  const out = new Set<string>();
  for (const s of screens) {
    if (s.content.type === "video" && s.content.src) out.add(s.content.src);
  }
  return [...out];
}

/** Screens that point at a video file that is not available. A screen with no file chosen is not "missing". */
export function countMissingVideos(
  screens: readonly Pick<Screen, "content">[],
  isAvailable: (src: string) => boolean,
): number {
  let n = 0;
  for (const s of screens) {
    if (s.content.type === "video" && s.content.src && !isAvailable(s.content.src)) n++;
  }
  return n;
}

export function describeImport(input: {
  setup: SceneSetup;
  skipped: number;
  currentScreenCount: number;
  currentModelName: string | null;
}): { replaces: string; modelNote: string | null } {
  const incoming = summarizeSetup(input.setup, input.skipped);
  const n = input.currentScreenCount;
  const replaces =
    n === 0
      ? `Import ${incoming}?`
      : `Import ${incoming}? This replaces the ${n} ${n === 1 ? "screen" : "screens"} in this scene.`;

  const made = input.setup.model?.name;
  const modelNote =
    made && input.currentModelName && made !== input.currentModelName
      ? `This setup was made for "${made}". The open model is "${input.currentModelName}", so screens may not line up.`
      : null;
  return { replaces, modelNote };
}