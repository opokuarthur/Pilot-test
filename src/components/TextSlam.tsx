// TextSlam: a word/number that slams in from big to its resting size with an
// overshoot spring, then keeps drifting slightly so it never sits dead still.
// Counting mode: pass `count={{ from: 0, to: 99858 }}` and the number ticks up
// while slamming. Use "\n" in `text` for line breaks.
import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { slam } from "../lib/motion";
import { ThemableProps, useTheme } from "../lib/theme-context";
import { springs } from "../config/theme";

export type CountSpec = {
  from: number;
  to: number;
  /** Frames the count takes (default 40). */
  frames?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

export type TextSlamProps = ThemableProps & {
  text?: string;
  count?: CountSpec;
  /** Frame (relative to the parent Sequence) where the slam starts. */
  at?: number;
  /** Optional frame where it exits (quick scale-down + fade). */
  exitAt?: number;
  fontSize?: number;
  color?: string;
  /** Font family (defaults to theme headline). */
  font?: string;
  /** Solid plate behind the text (e.g. a red label). */
  plate?: string;
  /** Rotation in degrees at rest. */
  rotate?: number;
  /** Starting scale before the slam. */
  fromScale?: number;
  /** Hard editorial drop shadow colour (null to disable). */
  shadow?: string | null;
  letterSpacing?: number;
  lineHeight?: number;
  /** Lines/words to colour differently, e.g. { "STORY.": "#E9B44C" }. */
  highlight?: Record<string, string>;
  springConfig?: Partial<{ damping: number; mass: number; stiffness: number }>;
  style?: React.CSSProperties;
};

const formatNumber = (n: number, decimals = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const TextSlam: React.FC<TextSlamProps> = ({
  text = "",
  count,
  at = 0,
  exitAt,
  fontSize = 140,
  color,
  font,
  plate,
  rotate = 0,
  fromScale = 2.4,
  shadow,
  letterSpacing = 1,
  lineHeight = 0.95,
  highlight,
  springConfig = springs.slam,
  style,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  if (frame < at) return null;

  const s = slam(frame, fps, at, springConfig);
  const scale = interpolate(s, [0, 1], [fromScale, 1]);
  const opacity = interpolate(frame - at, [0, 3], [0, 1], { extrapolateRight: "clamp" });
  // Slow living drift after landing.
  const settle = 1 + 0.025 * interpolate(frame - at, [12, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wobble = Math.sin((frame - at) / 22) * 0.6;
  const exit =
    exitAt !== undefined
      ? interpolate(frame, [exitAt, exitAt + 8], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.cubic),
        })
      : 1;
  if (exit <= 0) return null;

  let content = text;
  if (count) {
    const p = interpolate(frame - at, [0, count.frames ?? 40], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    const n = count.from + (count.to - count.from) * p;
    content = `${count.prefix ?? ""}${formatNumber(n, count.decimals)}${count.suffix ?? ""}`;
  }

  const fill = color ?? colors.cream;
  const sh = shadow === undefined ? colors.ink : shadow;
  const lines = content.split("\n");

  return (
    <div
      style={{
        display: "inline-block",
        transform: `scale(${scale * settle * (0.85 + 0.15 * exit)}) rotate(${rotate + wobble}deg)`,
        opacity: opacity * exit,
        fontFamily: font ?? fonts.headline,
        fontSize,
        lineHeight,
        letterSpacing,
        color: fill,
        textAlign: "center",
        whiteSpace: "pre",
        textTransform: "uppercase",
        background: plate,
        padding: plate ? `${fontSize * 0.08}px ${fontSize * 0.22}px ${fontSize * 0.04}px` : undefined,
        borderRadius: plate ? fontSize * 0.06 : undefined,
        textShadow: sh && !plate ? `${fontSize * 0.045}px ${fontSize * 0.045}px 0 ${sh}` : undefined,
        boxShadow: sh && plate ? `${fontSize * 0.06}px ${fontSize * 0.06}px 0 ${sh}` : undefined,
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>
          {line.split(" ").map((w, j) => (
            <span key={j} style={{ color: highlight?.[w] }}>
              {w}
              {j < line.split(" ").length - 1 ? " " : ""}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

/** Centers a TextSlam horizontally at a given y (center of the text). */
export const SlamAt: React.FC<{ y: number; x?: number; children: React.ReactNode }> = ({ y, x = 540, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: "translate(-50%, -50%)",
      display: "flex",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);
