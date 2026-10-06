// Shared motion rules so every component moves the same way.
import { interpolate, spring, Easing } from "remotion";
import { springs } from "../config/theme";

type SpringConfig = Partial<{ damping: number; mass: number; stiffness: number }>;

/** 0 → 1 with overshoot (peaks ~1.15), starting at `delay` frames. */
export const slam = (frame: number, fps: number, delay = 0, config: SpringConfig = springs.slam) =>
  spring({ frame: frame - delay, fps, config });

/** Small overshoot pop for UI elements. */
export const pop = (frame: number, fps: number, delay = 0, config: SpringConfig = springs.pop) =>
  spring({ frame: frame - delay, fps, config });

/** Scene push-in: scale from 1 to 1+amount over `duration` frames (linear, so it never stops). */
export const pushIn = (frame: number, duration: number, amount = 0.03) =>
  interpolate(frame, [0, Math.max(1, duration)], [1, 1 + amount], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/**
 * "Scam failed" look. progress 0 = full colour, 1 = grey and slightly dimmed.
 * Returns a CSS filter string so it works on any element, image or SVG.
 */
export const failFilter = (progress: number) => {
  const p = Math.min(1, Math.max(0, progress));
  return p === 0 ? "none" : `grayscale(${p}) brightness(${1 - 0.18 * p}) contrast(${1 - 0.1 * p})`;
};

/** Helper to build a 0→1 progress over a frame window with easing. */
export const progressBetween = (
  frame: number,
  start: number,
  end: number,
  easing: (t: number) => number = Easing.inOut(Easing.cubic),
) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
