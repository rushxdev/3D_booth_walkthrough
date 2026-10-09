import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { SCREEN_EMPTY_COLOR } from "../scene/theme";
import { labelCanvasSize, screenLabelLines } from "./screenLabel";

const TITLE_COLOR = "#b4b4b4";
const SUBTITLE_COLOR = "#808080";
const FONT = "system-ui, sans-serif";

function fitFont(ctx: CanvasRenderingContext2D, text: string, size: number, maxWidth: number) {
  ctx.font = `500 ${size}px ${FONT}`;
  const w = ctx.measureText(text).width;
  return w > maxWidth ? Math.max(8, (size * maxWidth) / w) : size;
}

function createLabelTexture(name: string, width: number, height: number): THREE.CanvasTexture {
  const [W, H] = labelCanvasSize(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    const { title, subtitle } = screenLabelLines(name, width, height);
    const side = Math.min(W, H);
    ctx.fillStyle = SCREEN_EMPTY_COLOR;
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const titleSize = fitFont(ctx, title, side * 0.16, W * 0.9);
    ctx.font = `500 ${titleSize}px ${FONT}`;
    ctx.fillStyle = TITLE_COLOR;
    ctx.fillText(title, W / 2, H / 2 - side * 0.06);

    const subSize = fitFont(ctx, subtitle, Math.min(side * 0.1, titleSize * 0.7), W * 0.9);
    ctx.font = `400 ${subSize}px ${FONT}`;
    ctx.fillStyle = SUBTITLE_COLOR;
    ctx.fillText(subtitle, W / 2, H / 2 + side * 0.1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Name-and-size texture for empty screens. Created and disposed in an effect (Strict Mode safe). */
export function useScreenLabelTexture(
  name: string,
  width: number,
  height: number,
  enabled: boolean,
): THREE.CanvasTexture | null {
  const texture = useMemo(
    () => (enabled ? createLabelTexture(name, width, height) : null),
    [name, width, height, enabled],
  );
  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}