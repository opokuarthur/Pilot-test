// VerdictPoll: split screen — "POSSIBLE ✅" on the left, "NO WAY ❌" on the
// right, with a VS badge on a slanted divider and a live poll bar that wobbles
// between the two. `bias` keyframes push the bar one way or the other; the
// leading side glows. The ✅ / ❌ marks are drawn as vector icons; pass
// `leftIcon` / `rightIcon` (any node, e.g. a big emoji) to replace them.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type VerdictPollProps = ThemableProps & {
  leftLabel?: string;
  rightLabel?: string;
  appearAt?: number;
  exitAt?: number;
  /** Left-side share (0–100) over time; the bar wobbles around it. */
  bias?: { at: number; value: number }[];
  /** Wobble size in percentage points. */
  wobble?: number;
  /** Vertical centre of the labels and of the poll bar (px). */
  labelY?: number;
  barY?: number;
  leftColor?: string;
  rightColor?: string;
  /** 0–1: dims everything (e.g. when a question slams on top). */
  dim?: number;
  /** Small caption under the bar. */
  caption?: string;
  /** Replace the ✅ / ❌ icons. */
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Label font size (long labels need less than the default 112). */
  labelSize?: number;
};

const Check: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x={4} y={8} width={92} height={92} rx={20} fill={shade(color, 0.35)} />
    <rect x={4} y={4} width={92} height={88} rx={20} fill={color} />
    <path d="M26 50 L44 68 L76 30" stroke="#fff" strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Cross: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M24 24 L76 76 M76 24 L24 76" stroke={shade(color, 0.35)} strokeWidth={22} strokeLinecap="round" transform="translate(0 4)" />
    <path d="M24 24 L76 76 M76 24 L24 76" stroke={color} strokeWidth={22} strokeLinecap="round" />
  </svg>
);

export const VerdictPoll: React.FC<VerdictPollProps> = ({
  leftLabel = "POSSIBLE",
  rightLabel = "NO WAY",
  appearAt = 0,
  exitAt,
  bias = [{ at: 0, value: 50 }],
  wobble = 9,
  labelY = 520,
  barY = 1090,
  leftColor,
  rightColor,
  dim = 0,
  caption = "WHAT DO YOU THINK?",
  leftIcon,
  rightIcon,
  labelSize = 112,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  if (frame < appearAt) return null;
  const L = leftColor ?? colors.up;
  const R = rightColor ?? colors.red;
  const inP = spring({ frame: frame - appearAt, fps, config: { damping: 14, mass: 0.7 } });
  const out = exitAt === undefined ? 1 : interpolate(frame, [exitAt, exitAt + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  if (out <= 0) return null;

  const base = interpolate(frame, bias.map((b) => b.at), bias.map((b) => b.value), {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const t = frame - appearAt;
  const fill = Math.min(1, t / 30);
  const v = Math.max(8, Math.min(92, 50 + (base - 50) * fill + wobble * (Math.sin(t / 7) * 0.6 + Math.sin(t / 13 + 1) * 0.4)));
  const lead = (v - 50) / 50; // -1..1
  const barW = 880;
  const barH = 110;

  const side = (label: string, color: string, left: boolean) => {
    const glow = Math.max(0, left ? lead : -lead);
    const slide = (1 - inP) * (left ? -600 : 600);
    return (
      <div
        style={{
          position: "absolute",
          left: left ? 60 : 560,
          width: 460,
          top: labelY - 220,
          height: 440,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          transform: `translateX(${slide}px) scale(${1 + glow * 0.08})`,
        }}
      >
        {left ? leftIcon ?? <Check size={170} color={color} /> : rightIcon ?? <Cross size={170} color={color} />}
        <div
          style={{
            fontFamily: fonts.headline,
            fontSize: labelSize,
            lineHeight: 1,
            color: colors.cream,
            textShadow: `5px 5px 0 ${colors.ink}`,
            letterSpacing: 2,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ opacity: out * (1 - dim * 0.65) }}>
      {/* Split background with slanted divider */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M0 0 H${560 + (1 - inP) * -700} L${520 + (1 - inP) * -700} 1920 H0 Z`} fill={alpha(L, 0.22 + 0.12 * Math.max(0, lead))} />
        <path d={`M1080 0 H${560 + (1 - inP) * 700} L${520 + (1 - inP) * 700} 1920 H1080 Z`} fill={alpha(R, 0.22 + 0.12 * Math.max(0, -lead))} />
        {/* Divider stops above the poll bar so it never crosses the captions */}
        <line x1={556} y1={0} x2={544} y2={barY - 90} stroke={colors.cream} strokeWidth={8} opacity={inP} />
      </svg>
      {side(leftLabel, L, true)}
      {side(rightLabel, R, false)}
      {/* VS badge */}
      <div
        style={{
          position: "absolute",
          left: 540 - 70,
          top: labelY + 230,
          width: 140,
          height: 140,
          borderRadius: 70,
          background: colors.gold,
          boxShadow: `6px 6px 0 ${colors.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fonts.headline,
          fontSize: 72,
          color: colors.navy,
          transform: `scale(${inP}) rotate(${Math.sin(t / 10) * 6}deg)`,
        }}
      >
        VS
      </div>
      {/* Poll bar */}
      <div style={{ position: "absolute", left: 540 - barW / 2, top: barY - barH / 2, width: barW, height: barH, transform: `scaleX(${inP})` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: barH / 2, background: R, boxShadow: `8px 8px 0 ${colors.ink}`, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v}%`, background: L }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: barH * 0.35, background: alpha("#ffffff", 0.18) }} />
        </div>
        {/* Knob */}
        <div
          style={{
            position: "absolute",
            left: `calc(${v}% - 24px)`,
            top: -16,
            width: 48,
            height: barH + 32,
            borderRadius: 16,
            background: colors.cream,
            border: `6px solid ${colors.ink}`,
          }}
        />
        <div style={{ position: "absolute", left: 34, top: 0, height: barH, display: "flex", alignItems: "center", fontFamily: fonts.body, fontWeight: 800, fontSize: 52, color: "#fff" }}>
          {Math.round(v)}%
        </div>
        <div style={{ position: "absolute", right: 34, top: 0, height: barH, display: "flex", alignItems: "center", fontFamily: fonts.body, fontWeight: 800, fontSize: 52, color: "#fff" }}>
          {100 - Math.round(v)}%
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: barY + barH / 2 + 26,
          textAlign: "center",
          fontFamily: fonts.body,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 6,
          color: tint(colors.grey, 0.4),
          opacity: inP,
        }}
      >
        {caption}
      </div>
    </AbsoluteFill>
  );
};
