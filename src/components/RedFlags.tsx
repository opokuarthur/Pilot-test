// RedFlags: flags pop in one at a time, each waving, with a label and an
// optional tag (e.g. "RUN") that slams in shortly after.
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pop, slam } from "../lib/motion";
import { shade } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type RedFlagItem = { label: string; at: number; tag?: string; tagAt?: number };

export type RedFlagsProps = ThemableProps & {
  items: RedFlagItem[];
  width?: number;
  rowHeight?: number;
  fontSize?: number;
  flagColor?: string;
  /** Frame the whole list exits (shrinks + fades). */
  exitAt?: number;
};

const Flag: React.FC<{ frame: number; color: string; size: number }> = ({ frame, color, size }) => {
  // Cloth edge waves with a travelling sine.
  const pts = Array.from({ length: 9 }, (_, k) => {
    const x = 18 + k * 13;
    const y = Math.sin(frame / 5 - k * 0.7) * 6 * (k / 8);
    return { x, y };
  });
  const top = pts.map((p, k) => `${k === 0 ? "M" : "L"}${p.x},${14 + p.y}`).join(" ");
  const bottom = [...pts].reverse().map((p) => `L${p.x},${84 + p.y}`).join(" ");
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 130 162">
      <rect x={8} y={6} width={10} height={152} rx={5} fill="#D9D2C5" />
      <circle cx={13} cy={8} r={8} fill="#D9D2C5" />
      <path d={`${top} ${bottom} Z`} fill={color} />
      <path d={`${top} L122,${30 + pts[8].y} L18,30 Z`} fill={shade(color, 0.15)} opacity={0.4} />
    </svg>
  );
};

export const RedFlags: React.FC<RedFlagsProps> = ({ items, width = 880, rowHeight = 250, fontSize = 72, flagColor, exitAt, ...themable }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  const exit = exitAt === undefined ? 1 : interpolate(frame, [exitAt, exitAt + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (exit <= 0) return null;
  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 10, opacity: exit, transform: `scale(${0.9 + 0.1 * exit})` }}>
      {items.map((item, i) => {
        if (frame < item.at) return <div key={i} style={{ height: rowHeight }} />;
        const p = pop(frame, fps, item.at);
        const tagAt = item.tagAt ?? item.at + 45;
        const tag = item.tag && frame >= tagAt ? slam(frame, fps, tagAt) : 0;
        return (
          <div key={i} style={{ height: rowHeight, display: "flex", alignItems: "center", gap: 30, transform: `translateX(${(1 - p) * -120}px) scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 1.5), transformOrigin: "left center" }}>
            <Flag frame={frame + i * 11} color={flagColor ?? colors.red} size={150} />
            <div style={{ flex: 1, whiteSpace: "pre-line", fontFamily: fonts.headline, fontSize, lineHeight: 0.98, color: colors.cream, textShadow: `5px 5px 0 ${colors.ink}` }}>{item.label}</div>
            {item.tag && tag > 0 ? (
              <div
                style={{
                  fontFamily: fonts.headline,
                  fontSize: fontSize * 0.75,
                  color: colors.cream,
                  background: colors.red,
                  padding: "6px 22px 2px",
                  borderRadius: 10,
                  transform: `scale(${interpolate(tag, [0, 1], [2.4, 1])}) rotate(-6deg)`,
                  boxShadow: `6px 6px 0 ${colors.ink}`,
                }}
              >
                {item.tag}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
