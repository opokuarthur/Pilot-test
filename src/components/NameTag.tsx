// NameTag: small lower-third label for a photo, e.g. "CRISTIANO RONALDO —
// CAPTAIN". Ink plate with a gold accent bar; the name in cream, the role in
// gold. Wipes open from the accent bar with a small overshoot.
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type NameTagProps = ThemableProps & {
  name: string;
  role?: string;
  appearAt?: number;
  exitAt?: number;
  fontSize?: number;
  plate?: string;
  accent?: string;
  rotate?: number;
};

export const NameTag: React.FC<NameTagProps> = ({
  name,
  role,
  appearAt = 0,
  exitAt,
  fontSize = 48,
  plate,
  accent,
  rotate = -1.5,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  if (frame < appearAt) return null;
  const p = spring({ frame: frame - appearAt, fps, config: { damping: 13, mass: 0.6, stiffness: 170 } });
  const open = interpolate(frame - appearAt, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (out >= 1) return null;
  const acc = accent ?? colors.gold;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "stretch",
        transform: `translateY(${(1 - p) * 40}px) rotate(${rotate}deg)`,
        opacity: Math.min(1, p * 2) * (1 - out),
        boxShadow: `6px 6px 0 ${colors.ink}`,
      }}
    >
      <div style={{ width: fontSize * 0.26, background: acc }} />
      <div
        style={{
          background: plate ?? colors.navy,
          padding: `${fontSize * 0.2}px ${fontSize * 0.42}px ${fontSize * 0.12}px`,
          clipPath: `inset(0 ${(1 - open) * 100}% 0 0)`,
          fontFamily: fonts.headline,
          fontSize,
          lineHeight: 1.05,
          letterSpacing: 1.5,
          whiteSpace: "nowrap",
          color: colors.cream,
        }}
      >
        {name}
        {role ? <span style={{ color: acc }}>{` — ${role}`}</span> : null}
      </div>
    </div>
  );
};
