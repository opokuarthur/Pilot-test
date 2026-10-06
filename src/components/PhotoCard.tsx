// PhotoCard: a real photo framed like a polaroid — thick cream border (wider
// at the bottom), rounded corners, soft drop shadow — that slides in with a
// slight rotation and an overshoot, then gently floats. Optional subtle warm
// grade (natural colour, no duotone) and a small credit label under the card.
//
// The photo is never cropped or distorted: it is drawn at its natural aspect
// ratio, as large as fits inside maxWidth × maxHeight (pass `aspect` to let a
// small photo scale UP to that box; without it the photo never exceeds its
// natural size). Place the card with a flex/centred parent; it sizes itself.
import React from "react";
import { Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, shade } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type PhotoCardProps = ThemableProps & {
  src: string;
  /** Natural width ÷ height. When given, the photo fills the max box (can scale up). */
  aspect?: number;
  /** Largest size of the photo itself (px), excluding the frame. */
  maxWidth?: number;
  maxHeight?: number;
  /** Frame thickness (sides/top) and bottom strip, in px. */
  border?: number;
  bottomBorder?: number;
  frameColor?: string;
  /** Resting rotation in degrees (about -4…4). */
  rotate?: number;
  /** Frame it slides in, and from which side. */
  appearAt?: number;
  from?: "left" | "right" | "bottom";
  /** Frame it slides out (optional). */
  exitAt?: number;
  /** Float amplitude in px. */
  float?: number;
  /** Warm grade strength 0–1 (0 = untouched). */
  warmth?: number;
  /** Credit shown under the card. */
  credit?: string;
  /** Drawn over the photo area (e.g. a callout ring); the box matches the photo exactly. */
  overlay?: React.ReactNode;
};

export const PhotoCard: React.FC<PhotoCardProps> = ({
  src,
  aspect,
  maxWidth = 760,
  maxHeight = 560,
  border = 18,
  bottomBorder = 52,
  frameColor,
  rotate = -3,
  appearAt = 0,
  from = "right",
  exitAt,
  float = 6,
  warmth = 0.3,
  credit,
  overlay,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  if (frame < appearAt) return null;
  const p = spring({ frame: frame - appearAt, fps, config: { damping: 12, mass: 0.8, stiffness: 120 } });
  const out =
    exitAt === undefined
      ? 0
      : interpolate(frame, [exitAt, exitAt + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  if (out >= 1) return null;
  const dir = from === "left" ? -1 : 1;
  const travel = (1 - p) + out;
  const dx = from === "bottom" ? 0 : dir * travel * (width * 0.9);
  const dy = from === "bottom" ? travel * 1100 : 0;
  // Starts more tilted, overshoots past the resting angle, settles.
  const rot = rotate + dir * (1 - p) * 10;
  const bob = Math.sin((frame - appearAt) / 30) * float;
  const sway = Math.sin((frame - appearAt) / 47 + 1) * 0.5;
  const w = warmth;
  const grade = w > 0 ? `sepia(${0.12 * w}) saturate(${1 + 0.06 * w}) brightness(${1 + 0.02 * w})` : undefined;
  const frameC = frameColor ?? colors.cream;
  const size = aspect
    ? { width: Math.min(maxWidth, maxHeight * aspect), height: Math.min(maxWidth, maxHeight * aspect) / aspect }
    : { width: "auto" as const, height: "auto" as const, maxWidth, maxHeight };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        transform: `translate(${dx}px, ${dy + bob}px) rotate(${rot + sway}deg)`,
      }}
    >
      <div
        style={{
          padding: `${border}px ${border}px ${bottomBorder}px`,
          background: frameC,
          borderRadius: border * 0.9,
          boxShadow: `0 ${border * 1.2}px ${border * 2.4}px ${alpha("#000000", 0.45)}, 0 2px 0 ${shade(frameC, 0.15)}`,
          lineHeight: 0,
        }}
      >
        <div style={{ position: "relative" }}>
          <Img
            src={src}
            style={{
              display: "block",
              ...size,
              borderRadius: border * 0.35,
              filter: grade,
            }}
          />
          {overlay ? <div style={{ position: "absolute", inset: 0, lineHeight: 1 }}>{overlay}</div> : null}
        </div>
      </div>
      {credit ? (
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 0.5,
            color: alpha(colors.cream, 0.75),
            whiteSpace: "nowrap",
            padding: "3px 12px",
            borderRadius: 14,
            background: alpha(colors.ink, 0.55),
          }}
        >
          {credit}
        </div>
      ) : null}
    </div>
  );
};
