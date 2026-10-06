export type FitMode = "contain" | "cover";

export type FitLayout = {
  /** Fraction of the screen the picture covers per axis (1 = full). */
  quad: [number, number];
  /** Texture repeat (crop). Always [1, 1] for contain. */
  repeat: [number, number];
  /** Texture offset (centers the crop). Always [0, 0] for contain. */
  offset: [number, number];
};

const full = (): FitLayout => ({ quad: [1, 1], repeat: [1, 1], offset: [0, 0] });

const isPositive = (n: number) => Number.isFinite(n) && n > 0;

/**
 * contain: the whole video is visible, bars fill the rest (smaller quad).
 * cover:   the screen is filled, the video is cropped (repeat + offset).
 * Invalid aspects fall back to a full stretch rather than NaN geometry.
 */
export function computeFit(
  contentAspect: number,
  screenAspect: number,
  fit: FitMode,
): FitLayout {
  if (!isPositive(contentAspect) || !isPositive(screenAspect)) return full();

  const ratio = contentAspect / screenAspect; // > 1: video is wider than the screen
  if (Math.abs(ratio - 1) < 1e-6) return full();

  if (fit === "contain") {
    return ratio > 1
      ? { quad: [1, 1 / ratio], repeat: [1, 1], offset: [0, 0] }
      : { quad: [ratio, 1], repeat: [1, 1], offset: [0, 0] };
  }

  return ratio > 1
    ? { quad: [1, 1], repeat: [1 / ratio, 1], offset: [(1 - 1 / ratio) / 2, 0] }
    : { quad: [1, 1], repeat: [1, ratio], offset: [0, (1 - ratio) / 2] };
}