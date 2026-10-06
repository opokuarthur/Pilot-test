// Keyframed props: lets a component prop be either a fixed value or a list of
// { at, value } changes over time, e.g.
//   expression={[{ at: 0, value: "happy" }, { at: 90, value: "worried" }]}
// resolveKeyframes() tells you what to blend between at the current frame.
import { Easing } from "remotion";

export type Keyframe<T> = { at: number; value: T };
export type Animatable<T> = T | Keyframe<T>[];

const isKeyframes = <T,>(v: Animatable<T>): v is Keyframe<T>[] => Array.isArray(v);

export const resolveKeyframes = <T,>(
  v: Animatable<T>,
  frame: number,
  blendFrames = 8,
): { from: T; to: T; t: number } => {
  if (!isKeyframes(v)) return { from: v, to: v, t: 1 };
  const kfs = [...v].sort((a, b) => a.at - b.at);
  let idx = -1;
  for (let i = 0; i < kfs.length; i++) if (kfs[i].at <= frame) idx = i;
  if (idx < 0) return { from: kfs[0].value, to: kfs[0].value, t: 1 };
  const to = kfs[idx].value;
  const from = idx > 0 ? kfs[idx - 1].value : to;
  const raw = Math.min(1, Math.max(0, (frame - kfs[idx].at) / Math.max(1, blendFrames)));
  return { from, to, t: Easing.inOut(Easing.cubic)(raw) };
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Lerp every numeric field of two same-shaped objects. */
export const lerpObj = <T extends Record<string, number>>(a: T, b: T, t: number): T =>
  Object.fromEntries(Object.keys(a).map((k) => [k, lerp(a[k], b[k], t)])) as T;
