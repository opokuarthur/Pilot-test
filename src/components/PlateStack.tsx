// PlateStack: plates drop (or slide) in and stack into a tower. Plates land on
// an accelerating schedule (firstGap → ×accel per plate → minGap), or at the
// exact frames in `landFrames`. The tower can grow off the top of the screen,
// or the camera can chase its top (`followY`) so plates rush down past us.
// Only plates on screen are drawn, so thousands of plates are cheap.
import React, { useMemo } from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type PlateSchedule = {
  count?: number;
  /** Frame the first plate lands. */
  startAt?: number;
  /** Frames between the first two plates. */
  firstGap?: number;
  /** Each gap = previous gap × accel (0.85 = speeds up). */
  accel?: number;
  /** Smallest gap in frames (fractions = several plates per frame). */
  minGap?: number;
  /** Exact landing frames (overrides the schedule above). */
  landFrames?: number[];
};

export type PlateStackProps = ThemableProps &
  PlateSchedule & {
    /** Horizontal centre of the stack (px). */
    x?: number;
    /** Bottom of the stack (px). */
    baseY?: number;
    plateWidth?: number;
    thickness?: number;
    /** Where plates come from. */
    entry?: "top" | "left" | "right";
    /** Frames a plate takes to fall / slide in. */
    travelFrames?: number;
    /** Once the top rises above this y, the camera follows it (undefined = never). */
    followY?: number;
    /** Tower sway in px at full height. */
    sway?: number;
    plateColor?: string;
    rimColor?: string;
    /** Render prop for things that should track the stack: plates landed + camera offset (px, add to y). */
    children?: (state: { landed: number; cam: number }) => React.ReactNode;
  };

/** Landing frame of every plate for a schedule. */
export const plateLandFrames = ({ count = 30, startAt = 0, firstGap = 30, accel = 0.85, minGap = 0.05, landFrames }: PlateSchedule) => {
  if (landFrames) return landFrames.slice(0, count);
  const out: number[] = [];
  let t = startAt;
  let gap = firstGap;
  for (let i = 0; i < count; i++) {
    out.push(t);
    t += gap;
    gap = Math.max(minGap, gap * accel);
  }
  return out;
};

/** Continuous number of plates landed at `frame` (fractional between landings). */
const landedAt = (times: number[], frame: number) => {
  let lo = 0;
  let hi = times.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= frame) lo = mid + 1;
    else hi = mid;
  }
  if (lo === 0 || lo >= times.length) return lo;
  const a = times[lo - 1];
  const b = times[lo];
  return lo - 1 + Math.min(1, (frame - a) / Math.max(0.001, b - a));
};

export const PlateStack: React.FC<PlateStackProps> = ({
  x = 540,
  baseY = 1200,
  plateWidth = 440,
  thickness = 18,
  entry = "top",
  travelFrames = 10,
  followY,
  sway = 14,
  plateColor,
  rimColor,
  children,
  count = 30,
  startAt = 0,
  firstGap = 30,
  accel = 0.85,
  minGap = 0.05,
  landFrames,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { colors } = useTheme(themable);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const times = useMemo(
    () => plateLandFrames({ count, startAt, firstGap, accel, minGap, landFrames }),
    [count, startAt, firstGap, accel, minGap, landFrames],
  );
  const plate = plateColor ?? colors.cream;
  const rim = rimColor ?? "#3E6FB0";
  const w = plateWidth;
  const th = thickness;

  // Camera chases the top of the tower (smoothed over a few frames).
  const camAt = (f: number) => (followY === undefined ? 0 : Math.max(0, followY - (baseY - landedAt(times, f) * th)));
  let cam = 0;
  for (let k = 0; k < 6; k++) cam += camAt(frame - k) / 6;
  const camSpeed = cam - camAt(frame - 6);

  const landed = Math.floor(landedAt(times, frame));
  const swayAt = (restBottom: number) => {
    const h = baseY - restBottom;
    return sway * Math.sin(frame / 16) * Math.pow(Math.min(1, h / 1100), 2);
  };

  // Visible index window.
  const iMin = Math.max(0, Math.floor((baseY + cam - height) / th) - 1);
  const items: React.ReactNode[] = [];
  let topIdx = -1;
  for (let i = iMin; i < times.length; i++) {
    const land = times[i];
    if (land - travelFrames > frame) break;
    const restBottom = baseY - i * th + cam;
    if (restBottom < -th * 2 && land <= frame) continue;
    let dx = 0;
    let dy = 0;
    let rot = 0;
    if (land > frame) {
      const p = interpolate(frame, [land - travelFrames, land], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (entry === "top") {
        dy = -(restBottom + th * 4) * (1 - Easing.in(Easing.quad)(p));
      } else {
        const dir = entry === "left" ? -1 : 1;
        const e = Easing.out(Easing.cubic)(p);
        dx = dir * (width / 2 + w) * (1 - e);
        rot = dir * 8 * (1 - e);
      }
    } else if (frame - land < 6 && entry === "top") {
      // Tiny bounce on landing.
      dy = -Math.sin(((frame - land) / 6) * Math.PI) * th * 0.35;
    }
    const y = restBottom + dy;
    if (y < -th * 2 || y - th > height + th) continue;
    if (land <= frame) topIdx = i;
    items.push(
      <g key={i} transform={`translate(${x + dx + swayAt(baseY - i * th)} ${y}) rotate(${rot})`}>
        <rect x={-w / 2} y={-th} width={w} height={th} rx={th / 2} fill={`url(#pl${uid})`} />
        <rect x={-w / 2 + th * 0.4} y={-th + 2} width={w - th * 0.8} height={2.5} rx={1.2} fill={rim} opacity={0.9} />
        <rect x={-w / 2 + th * 0.5} y={-3.5} width={w - th} height={2.5} rx={1.2} fill={shade(plate, 0.28)} />
        {land > frame ? <PlateTop w={w} th={th} plate={plate} rim={rim} /> : null}
      </g>,
    );
  }
  // Face of the top plate on the tower.
  if (topIdx >= 0) {
    const restBottom = baseY - topIdx * th + cam;
    items.push(
      <g key="top" transform={`translate(${x + swayAt(baseY - topIdx * th)} ${restBottom})`}>
        <PlateTop w={w} th={th} plate={plate} rim={rim} />
      </g>,
    );
  }

  // Impact puffs for the first few plates.
  const puffs: React.ReactNode[] = [];
  for (let i = 0; i < Math.min(4, times.length); i++) {
    const since = frame - times[i];
    if (since < 0 || since > 10 || entry !== "top") continue;
    const yy = baseY - i * th + cam - th / 2;
    const o = 1 - since / 10;
    [-1, 1].forEach((side) =>
      puffs.push(
        <g key={`${i}${side}`} opacity={o} stroke={colors.cream} strokeWidth={6} strokeLinecap="round">
          <line x1={x + side * (w / 2 + 20 + since * 3)} y1={yy - 18} x2={x + side * (w / 2 + 50 + since * 4)} y2={yy - 36} />
          <line x1={x + side * (w / 2 + 24 + since * 3)} y1={yy + 4} x2={x + side * (w / 2 + 60 + since * 4)} y2={yy + 4} />
        </g>,
      ),
    );
  }

  // Speed streaks while the camera is rushing up.
  const streakO = Math.min(0.5, Math.max(0, (camSpeed - 20) / 120));
  const streaks =
    streakO > 0.01
      ? Array.from({ length: 10 }, (_, k) => {
          const sx = k % 2 ? x - w / 2 - 60 - (k * 37) % 180 : x + w / 2 + 60 + (k * 53) % 180;
          const sy = ((frame * 60 + k * 397) % (height + 600)) - 300;
          return <rect key={k} x={sx} y={sy} width={6} height={220} rx={3} fill={colors.cream} opacity={streakO} />;
        })
      : null;

  return (
    <>
      <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, overflow: "hidden" }}>
        <defs>
          <linearGradient id={`pl${uid}`} x1="0" x2="1">
            <stop offset="0" stopColor={tint(plate, 0.4)} />
            <stop offset="0.35" stopColor={plate} />
            <stop offset="1" stopColor={shade(plate, 0.22)} />
          </linearGradient>
        </defs>
        {/* Contact shadow */}
        {baseY + cam < height + 20 && landed > 0 ? (
          <ellipse cx={x} cy={baseY + cam + 4} rx={w * 0.6} ry={16} fill="#000" opacity={0.28} />
        ) : null}
        {streaks}
        {items}
        {puffs}
      </svg>
      {children ? children({ landed: Math.min(times.length, landed), cam }) : null}
    </>
  );
};

/** The visible top face of a plate (an ellipse with a well and rim stripe). */
const PlateTop: React.FC<{ w: number; th: number; plate: string; rim: string }> = ({ w, th, plate, rim }) => {
  const ry = w * 0.085;
  return (
    <g transform={`translate(0 ${-th})`}>
      <ellipse cx={0} cy={0} rx={w / 2} ry={ry} fill={tint(plate, 0.15)} />
      <ellipse cx={0} cy={0} rx={w / 2 - 10} ry={ry - 3} fill="none" stroke={rim} strokeWidth={3} />
      <ellipse cx={0} cy={2} rx={w * 0.3} ry={ry * 0.58} fill={shade(plate, 0.07)} stroke={alpha("#000000", 0.08)} strokeWidth={2} />
    </g>
  );
};
