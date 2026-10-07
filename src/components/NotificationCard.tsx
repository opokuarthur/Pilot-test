// NotificationCard: a generic social-post notification ("New post") that
// slides in with an overshoot, flashes a glow ring and gives a tiny buzz.
// No real app branding: the icon is an abstract gradient tile with a bell,
// the account is a faceless avatar and grey placeholder bars stand in for
// the post text unless `body` is given.
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type NotificationCardProps = ThemableProps & {
  title?: string;
  /** Post text; omit for placeholder bars. */
  body?: string;
  /** Small header label (generic, never an app name). */
  source?: string;
  time?: string;
  width?: number;
  appearAt?: number;
  exitAt?: number;
  from?: "top" | "right";
  /** Accent for the icon tile and glow. */
  accent?: string;
};

const Bell: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M50 14 C30 14 24 32 24 48 L24 64 L14 76 L86 76 L76 64 L76 48 C76 32 70 14 50 14 Z" fill={color} />
    <circle cx={50} cy={84} r={9} fill={color} />
    <circle cx={50} cy={12} r={6} fill={color} />
  </svg>
);

export const NotificationCard: React.FC<NotificationCardProps> = ({
  title = "New post",
  body,
  source = "NOTIFICATIONS",
  time = "now",
  width = 820,
  appearAt = 0,
  exitAt,
  from = "top",
  accent,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  if (frame < appearAt) return null;
  const acc = accent ?? colors.red;
  const t = frame - appearAt;
  const p = spring({ frame: t, fps, config: { damping: 11, mass: 0.6, stiffness: 160 } });
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  if (out >= 1) return null;
  const travel = (1 - p) + out;
  const dx = from === "right" ? travel * 1100 : 0;
  const dy = from === "top" ? -travel * 700 : 0;
  // Buzz right after landing.
  const buzz = t > 8 && t < 22 ? Math.sin(t * 2.6) * 5 * (1 - (t - 8) / 14) : 0;
  const ring = interpolate(t, [6, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const h = width * 0.27;
  const icon = h * 0.62;

  return (
    <div style={{ position: "relative", width, transform: `translate(${dx + buzz}px, ${dy}px)` }}>
      {/* Glow ring flash */}
      {ring > 0 && ring < 1 ? (
        <div
          style={{
            position: "absolute",
            inset: -10 - ring * 40,
            borderRadius: 44 + ring * 40,
            border: `${6 * (1 - ring)}px solid ${alpha(acc, 0.9)}`,
            opacity: 1 - ring,
          }}
        />
      ) : null}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: width * 0.035,
          padding: `${h * 0.17}px ${width * 0.04}px`,
          borderRadius: 40,
          background: alpha(colors.cream, 0.97),
          boxShadow: `0 24px 50px ${alpha("#000000", 0.45)}, 8px 8px 0 ${colors.ink}`,
        }}
      >
        {/* Icon tile: abstract gradient + bell, no brand */}
        <div
          style={{
            width: icon,
            height: icon,
            flex: "none",
            borderRadius: icon * 0.26,
            background: `linear-gradient(135deg, ${colors.gold}, ${acc})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `rotate(${t < 30 ? Math.sin(t * 0.9) * 14 * (1 - t / 30) : 0}deg)`,
          }}
        >
          <Bell size={icon * 0.58} color={colors.cream} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: h * 0.06 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fonts.body, fontWeight: 800, fontSize: h * 0.13, letterSpacing: 2, color: colors.grey }}>
            <span>{source}</span>
            <span style={{ letterSpacing: 0 }}>{time}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: h * 0.08 }}>
            {/* Faceless avatar */}
            <div style={{ width: h * 0.26, height: h * 0.26, borderRadius: "50%", background: shade(colors.grey, 0.2), border: `3px solid ${acc}`, flex: "none", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", left: "30%", top: "18%", width: "40%", height: "40%", borderRadius: "50%", background: tint(colors.grey, 0.5) }} />
              <div style={{ position: "absolute", left: "15%", top: "62%", width: "70%", height: "60%", borderRadius: "50%", background: tint(colors.grey, 0.5) }} />
            </div>
            <span style={{ fontFamily: fonts.body, fontWeight: 800, fontSize: h * 0.22, color: colors.ink, whiteSpace: "nowrap" }}>{title}</span>
          </div>
          {body ? (
            <div style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: h * 0.14, color: shade(colors.grey, 0.3) }}>{body}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: h * 0.05 }}>
              <div style={{ width: "88%", height: h * 0.07, borderRadius: h, background: tint(colors.grey, 0.45) }} />
              <div style={{ width: "58%", height: h * 0.07, borderRadius: h, background: tint(colors.grey, 0.55) }} />
            </div>
          )}
        </div>
        {/* Unread dot */}
        <div style={{ width: h * 0.1, height: h * 0.1, borderRadius: "50%", background: acc, flex: "none", alignSelf: "flex-start", marginTop: h * 0.04 }} />
      </div>
    </div>
  );
};
