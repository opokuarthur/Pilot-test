// Shared motion rules so every component moves the same way.
import { spring } from "remotion";
import { springs } from "../config/theme";

type SpringConfig = Partial<{ damping: number; mass: number; stiffness: number }>;

/** 0 → 1 with overshoot (peaks ~1.15), starting at `delay` frames. */
export const slam = (frame: number, fps: number, delay = 0, config: SpringConfig = springs.slam) =>
  spring({ frame: frame - delay, fps, config });

/** Small overshoot pop for UI elements. */
export const pop = (frame: number, fps: number, delay = 0, config: SpringConfig = springs.pop) =>
  spring({ frame: frame - delay, fps, config });

/**
 * "Scam failed" look. progress 0 = full colour, 1 = grey and slightly dimmed.
 * Returns a CSS filter string so it works on any element, image or SVG.
 */
export const failFilter = (progress: number) => {
  const p = Math.min(1, Math.max(0, progress));
  return p === 0 ? "none" : `grayscale(${p}) brightness(${1 - 0.18 * p}) contrast(${1 - 0.1 * p})`;
};
