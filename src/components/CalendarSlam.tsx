// CalendarSlam: a tear-off calendar page that slams in (big → size with an
// overshoot, a dust ring and a small shake). Generic date graphic: a header
// strip with spiral rings, a month grid of blank day cells, and ONE cell
// circled in red (`highlight`), so two calendars side by side clearly show
// "the same date" without naming one.
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type CalendarSlamProps = ThemableProps & {
  at?: number;
  exitAt?: number;
  /** Page width; height = width × 1.1. */
  width?: number;
  header?: string;
  /** Index of the circled cell (0–34). */
  highlight?: number;
  rotate?: number;
  headerColor?: string;
};

export const CalendarSlam: React.FC<CalendarSlamProps> = ({ at = 0, exitAt, width = 320, header = "SAME DAY", highlight = 17, rotate = -3, headerColor, ...themable }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  if (frame < at) return null;
  const t = frame - at;
  const s = spring({ frame: t, fps, config: { damping: 9, mass: 0.6, stiffness: 170 } });
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  if (out >= 1) return null;
  const W = width;
  const H = W * 1.1;
  const hc = headerColor ?? colors.red;
  const dust = interpolate(t, [4, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring = interpolate(t, [12, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const cols = 7;
  const rows = 5;
  const gx = W * 0.08;
  const gy = H * 0.34;
  const cw = (W - 2 * gx) / cols;
  const ch = (H - gy - H * 0.06) / rows;
  const hx = gx + (highlight % cols) * cw + cw / 2;
  const hy = gy + Math.floor(highlight / cols) * ch + ch / 2;

  return (
    <div style={{ position: "relative", width: W, height: H, transform: `scale(${interpolate(s, [0, 1], [2.3, 1]) * (1 - out * 0.5)}) rotate(${rotate}deg)`, opacity: Math.min(1, t / 3) * (1 - out) }}>
      {/* Dust ring on impact */}
      {dust > 0 && dust < 1 ? (
        <div style={{ position: "absolute", left: -W * 0.3 * dust, right: -W * 0.3 * dust, top: H * 0.7 - 30 * dust, height: 60 + 60 * dust, borderRadius: "50%", border: `${8 * (1 - dust)}px solid ${alpha(colors.cream, 0.7)}`, opacity: 1 - dust }} />
      ) : null}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <rect x={10} y={14} width={W} height={H} rx={W * 0.05} fill="#000" opacity={0.35} />
        <rect x={0} y={0} width={W} height={H} rx={W * 0.05} fill={colors.cream} />
        {/* Header */}
        <path d={`M0 ${W * 0.05} Q0 0 ${W * 0.05} 0 H${W * 0.95} Q${W} 0 ${W} ${W * 0.05} V${H * 0.24} H0 Z`} fill={hc} />
        <text x={W / 2} y={H * 0.19} textAnchor="middle" fontFamily={fonts.headline} fontSize={W * 0.15} fill={colors.cream} letterSpacing={3}>
          {header}
        </text>
        {/* Spiral rings */}
        {Array.from({ length: 6 }, (_, k) => (
          <g key={k}>
            <circle cx={W * (0.14 + k * 0.144)} cy={H * 0.035} r={W * 0.022} fill={shade(hc, 0.4)} />
            <rect x={W * (0.14 + k * 0.144) - W * 0.012} y={-H * 0.05} width={W * 0.024} height={H * 0.08} rx={W * 0.012} fill={tint(colors.grey, 0.3)} />
          </g>
        ))}
        {/* Weekday strip */}
        {Array.from({ length: cols }, (_, c) => (
          <rect key={c} x={gx + c * cw + cw * 0.25} y={H * 0.27} width={cw * 0.5} height={H * 0.022} rx={4} fill={alpha(colors.navy, 0.35)} />
        ))}
        {/* Day cells (blank) */}
        {Array.from({ length: rows * cols }, (_, i) => (
          <rect key={i} x={gx + (i % cols) * cw + cw * 0.12} y={gy + Math.floor(i / cols) * ch + ch * 0.12} width={cw * 0.76} height={ch * 0.76} rx={cw * 0.14} fill={i === highlight ? alpha(hc, 0.9) : alpha(colors.grey, 0.22)} />
        ))}
        {/* Hand-drawn circle around the day */}
        <ellipse cx={hx} cy={hy} rx={cw * 0.78} ry={ch * 0.78} fill="none" stroke={hc} strokeWidth={W * 0.022} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} transform={`rotate(-8 ${hx} ${hy})`} />
      </svg>
    </div>
  );
};
