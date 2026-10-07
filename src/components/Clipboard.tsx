// Clipboard: a plan board (hardboard + metal clip + paper) with a title and
// lines that tick on one by one: each line writes in, then a green check box
// pops and its tick draws itself.
//   items={[{ text: "Match 1", at: 30 }, { text: "Final match", at: 90 }]}
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type ClipboardItem = { text: string; at: number; /** Frame the tick lands (default at + 12). */ tickAt?: number };

export type ClipboardProps = ThemableProps & {
  width?: number;
  title?: string;
  items: ClipboardItem[];
  appearAt?: number;
  exitAt?: number;
  /** Faint placeholder rows under the items. */
  emptyRows?: number;
  rotate?: number;
};

/** ✅-style tick box, drawn as vector. `draw` 0–1 draws the tick. */
export const TickBox: React.FC<{ size: number; draw: number; pop: number; color: string }> = ({ size, draw, pop, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `scale(${pop})`, overflow: "visible" }}>
    <rect x={4} y={8} width={92} height={92} rx={20} fill={shade(color, 0.35)} />
    <rect x={4} y={4} width={92} height={88} rx={20} fill={color} />
    <path d="M26 50 L44 68 L76 30" stroke="#fff" strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
  </svg>
);

export const Clipboard: React.FC<ClipboardProps> = ({
  width = 620,
  title = "THE PLAN",
  items,
  appearAt = 0,
  exitAt,
  emptyRows = 1,
  rotate = -2,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  if (frame < appearAt) return null;
  const W = width;
  const rowH = W * 0.17;
  const H = W * 0.36 + (items.length + emptyRows) * rowH + W * 0.08;
  const p = spring({ frame: frame - appearAt, fps, config: { damping: 12, mass: 0.7, stiffness: 140 } });
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  if (out >= 1) return null;
  const board = "#7A4A26";
  const bob = Math.sin((frame - appearAt) / 30) * 4;

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        transform: `translateY(${(1 - p) * 900 + out * 900 + bob}px) rotate(${rotate + (1 - p) * 8}deg)`,
      }}
    >
      {/* Board */}
      <div style={{ position: "absolute", inset: 0, borderRadius: W * 0.05, background: `linear-gradient(160deg, ${tint(board, 0.12)}, ${shade(board, 0.15)})`, boxShadow: `0 26px 50px ${alpha("#000000", 0.45)}, 8px 8px 0 ${colors.ink}` }} />
      {/* Paper */}
      <div style={{ position: "absolute", left: W * 0.06, right: W * 0.06, top: W * 0.11, bottom: W * 0.05, borderRadius: W * 0.015, background: colors.cream, boxShadow: `0 4px 0 ${shade(colors.cream, 0.2)}` }} />
      {/* Clip */}
      <div style={{ position: "absolute", left: W * 0.3, width: W * 0.4, top: -W * 0.035, height: W * 0.13, borderRadius: W * 0.03, background: `linear-gradient(${tint(colors.grey, 0.5)}, ${shade(colors.grey, 0.2)})`, boxShadow: `0 6px 0 ${shade(colors.grey, 0.5)}` }} />
      <div style={{ position: "absolute", left: W * 0.44, width: W * 0.12, top: -W * 0.07, height: W * 0.07, borderRadius: `${W * 0.06}px ${W * 0.06}px 0 0`, border: `${W * 0.016}px solid ${shade(colors.grey, 0.15)}`, borderBottom: "none" }} />
      {/* Title */}
      <div style={{ position: "absolute", left: W * 0.12, right: W * 0.12, top: W * 0.15, fontFamily: fonts.headline, fontSize: W * 0.13, lineHeight: 1, color: colors.navy, letterSpacing: 2 }}>
        {title}
      </div>
      <div style={{ position: "absolute", left: W * 0.12, width: W * 0.42, top: W * 0.3, height: W * 0.012, borderRadius: 4, background: colors.red }} />
      {/* Rows */}
      {[...items, ...Array.from({ length: emptyRows }, () => null)].map((it, i) => {
        const top = W * 0.36 + i * rowH;
        const line = <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: alpha(colors.grey, 0.35) }} />;
        if (!it) {
          return (
            <div key={i} style={{ position: "absolute", left: W * 0.12, right: W * 0.12, top, height: rowH }}>
              {line}
            </div>
          );
        }
        const chars = Math.max(0, Math.floor((frame - it.at) / 1.4));
        const tickAt = it.tickAt ?? it.at + 12;
        const pop = frame < tickAt ? 0 : spring({ frame: frame - tickAt, fps, config: { damping: 9, mass: 0.5, stiffness: 200 } });
        const draw = interpolate(frame, [tickAt + 3, tickAt + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const flash = interpolate(frame, [tickAt, tickAt + 4, tickAt + 20], [0, 0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ position: "absolute", left: W * 0.12, right: W * 0.12, top, height: rowH, display: "flex", alignItems: "center", gap: W * 0.04 }}>
            <div style={{ position: "absolute", inset: `${rowH * 0.1}px -${W * 0.02}px`, borderRadius: 10, background: alpha(colors.up, flash) }} />
            {line}
            <div style={{ position: "relative", width: rowH * 0.62, height: rowH * 0.62, flex: "none", borderRadius: rowH * 0.14, border: `4px solid ${alpha(colors.grey, 0.7)}` }}>
              {frame >= tickAt ? (
                <div style={{ position: "absolute", left: -6, top: -6 }}>
                  <TickBox size={rowH * 0.62 + 4} draw={draw} pop={pop} color={colors.up} />
                </div>
              ) : null}
            </div>
            <div style={{ position: "relative", fontFamily: fonts.body, fontWeight: 800, fontSize: rowH * 0.44, color: colors.ink, whiteSpace: "nowrap" }}>
              {it.text.slice(0, chars)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
