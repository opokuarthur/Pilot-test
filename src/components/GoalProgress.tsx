// GoalProgress: a big goal counter racing up to `value` (e.g. 979) with a
// progress bar toward `target` (1,000): gold fill, a ball riding the tip, a
// pulsing striped gap for what's left, and a "21 TO GO" pill that slams in.
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, shade } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type GoalProgressProps = ThemableProps & {
  value?: number;
  target?: number;
  /** Count (and bar) start value. */
  countFrom?: number;
  appearAt?: number;
  countFrames?: number;
  /** Frame the "N TO GO" pill slams in (default: when the count lands). */
  toGoAt?: number;
  label?: string;
  width?: number;
  exitAt?: number;
};

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/** Generic football: white ball with dark patches. */
export const Ball: React.FC<{ size: number; spin?: number }> = ({ size, spin = 0 }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{ overflow: "visible" }}>
    <circle r={46} fill="#F7F7F2" stroke="#111" strokeWidth={4} />
    <g transform={`rotate(${spin})`} fill="#111">
      <path d="M0 -16 L15 -5 L9 13 L-9 13 L-15 -5 Z" />
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} transform={`rotate(${a}) translate(0 -38)`} d="M0 -8 L9 -1 L6 9 L-6 9 L-9 -1 Z" />
      ))}
    </g>
  </svg>
);

export const GoalProgress: React.FC<GoalProgressProps> = ({
  value = 979,
  target = 1000,
  countFrom = 900,
  appearAt = 0,
  countFrames = 70,
  toGoAt,
  label = "CAREER GOALS",
  width = 880,
  exitAt,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  if (frame < appearAt) return null;
  const t = frame - appearAt;
  const inP = spring({ frame: t, fps, config: { damping: 12, mass: 0.7 } });
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  if (out >= 1) return null;
  const c = interpolate(t, [6, 6 + countFrames], [countFrom, value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const landed = t >= 6 + countFrames;
  const land = landed ? spring({ frame: t - 6 - countFrames, fps, config: { damping: 8, mass: 0.5, stiffness: 200 } }) : 0;
  const goAt = toGoAt ?? appearAt + 6 + countFrames + 6;
  const goP = frame < goAt ? 0 : spring({ frame: frame - goAt, fps, config: { damping: 9, mass: 0.6, stiffness: 170 } });
  // Bar shows the last stretch (from 900) so the remaining gap reads clearly.
  const barFrom = Math.min(countFrom, value);
  const frac = (c - barFrom) / (target - barFrom);
  const barW = width;
  const barH = 70;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 5);

  return (
    <div style={{ width, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${0.6 + 0.4 * inP})`, opacity: Math.min(1, inP * 1.4) * (1 - out) }}>
      <div style={{ fontFamily: fonts.body, fontWeight: 800, fontSize: 34, letterSpacing: 8, color: alpha(colors.cream, 0.7) }}>{label}</div>
      <div
        style={{
          fontFamily: fonts.headline,
          fontSize: 300,
          lineHeight: 1,
          color: colors.gold,
          textShadow: `12px 12px 0 ${colors.ink}`,
          fontVariantNumeric: "tabular-nums",
          transform: `scale(${1 + 0.08 * Math.sin(land * Math.PI)})`,
        }}
      >
        {fmt(c)}
      </div>
      {/* Bar */}
      <div style={{ position: "relative", width: barW, height: barH, marginTop: 26 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: barH / 2, background: colors.ink, boxShadow: `8px 8px 0 #000`, overflow: "hidden" }}>
          {/* Remaining gap: striped red, pulsing */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `repeating-linear-gradient(-45deg, ${alpha(colors.red, 0.35 + 0.35 * pulse * (landed ? 1 : 0))} 0 18px, transparent 18px 36px)`,
              backgroundPosition: `${frame * 2}px 0`,
            }}
          />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${frac * 100}%`, background: `linear-gradient(${colors.gold}, ${shade(colors.gold, 0.2)})` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: barH * 0.32, background: alpha("#ffffff", 0.18) }} />
        </div>
        {/* Ball on the tip */}
        <div style={{ position: "absolute", left: `calc(${frac * 100}% - 44px)`, top: -9 }}>
          <Ball size={88} spin={c * 12} />
        </div>
        {/* Scale labels */}
        <div style={{ position: "absolute", left: 0, top: barH + 14, fontFamily: fonts.body, fontWeight: 800, fontSize: 30, color: alpha(colors.cream, 0.6) }}>{fmt(barFrom)}</div>
        <div style={{ position: "absolute", right: 0, top: barH + 14, fontFamily: fonts.headline, fontSize: 52, color: colors.cream, letterSpacing: 1 }}>{fmt(target)}</div>
      </div>
      {/* N TO GO */}
      <div
        style={{
          marginTop: 70,
          transform: `scale(${interpolate(goP, [0, 1], [2.2, 1])}) rotate(-3deg)`,
          opacity: Math.min(1, goP * 3),
          fontFamily: fonts.headline,
          fontSize: 120,
          lineHeight: 1,
          color: colors.cream,
          background: colors.red,
          padding: "10px 30px 4px",
          borderRadius: 10,
          boxShadow: `8px 8px 0 ${colors.ink}`,
          letterSpacing: 2,
        }}
      >
        {fmt(target - value)} TO GO
      </div>
    </div>
  );
};
