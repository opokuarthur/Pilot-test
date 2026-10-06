// StampGrid: a grid of generic app icons (abstract shapes, never real logos).
// A red "NOT LICENSED" stamp slams onto each in turn (speeding up), each
// stamped icon greys out, and a big counter ticks up to the final count.
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { failFilter, pop, slam } from "../lib/motion";
import { alpha, shade } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type StampGridProps = ThemableProps & {
  count?: number;
  cols?: number;
  iconSize?: number;
  gap?: number;
  /** Frame icons start popping in. */
  appearAt?: number;
  /** First and last stamp frames (stamps accelerate in between). */
  stampStart?: number;
  stampEnd?: number;
  stampText?: string;
  /** Label under the counter. */
  label?: string;
  iconColors?: string[];
};

const GLYPHS = ["coin", "chart", "diamond", "bolt", "ring", "chevrons", "star", "bars", "hex", "triangle", "leaf", "orbit"] as const;
type Glyph = (typeof GLYPHS)[number];

/** Abstract glyph in a 100×100 box. */
const GlyphShape: React.FC<{ g: Glyph; c: string }> = ({ g, c }) => {
  switch (g) {
    case "coin":
      return (
        <g>
          <circle cx="50" cy="50" r="28" fill={c} />
          <circle cx="50" cy="50" r="17" fill="none" stroke={alpha("#000000", 0.25)} strokeWidth="6" />
        </g>
      );
    case "chart":
      return <path d="M24 70 L42 52 L56 62 L78 32" stroke={c} strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    case "diamond":
      return <path d="M50 20 L78 50 L50 80 L22 50 Z" fill={c} />;
    case "bolt":
      return <path d="M56 16 L28 56 H48 L42 84 L72 42 H52 Z" fill={c} />;
    case "ring":
      return <circle cx="50" cy="50" r="24" fill="none" stroke={c} strokeWidth="12" />;
    case "chevrons":
      return <path d="M30 62 L50 42 L70 62 M30 44 L50 24 L70 44" stroke={c} strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    case "star":
      return <path d="M50 18 L58 42 L82 50 L58 58 L50 82 L42 58 L18 50 L42 42 Z" fill={c} />;
    case "bars":
      return (
        <g fill={c}>
          <rect x="24" y="52" width="13" height="26" rx="4" />
          <rect x="44" y="38" width="13" height="40" rx="4" />
          <rect x="64" y="24" width="13" height="54" rx="4" />
        </g>
      );
    case "hex":
      return <path d="M50 20 L76 35 V65 L50 80 L24 65 V35 Z" fill={c} />;
    case "triangle":
      return <path d="M50 22 L80 76 H20 Z" fill={c} />;
    case "leaf":
      return <path d="M24 76 C24 40 50 22 78 22 C78 54 60 76 24 76 Z" fill={c} />;
    case "orbit":
      return (
        <g>
          <circle cx="50" cy="50" r="12" fill={c} />
          <ellipse cx="50" cy="50" rx="30" ry="14" fill="none" stroke={c} strokeWidth="6" transform="rotate(-25 50 50)" />
        </g>
      );
  }
};

export const StampGrid: React.FC<StampGridProps> = ({
  count = 23,
  cols = 5,
  iconSize = 140,
  gap = 26,
  appearAt = 0,
  stampStart = 40,
  stampEnd = 230,
  stampText = "NOT\nLICENSED",
  label = "PLATFORMS",
  iconColors = ["#2E86AB", "#7A4E9C", "#2F7D5B", "#C8553D", "#E9B44C", "#3E6FB0", "#B23A48", "#1F9E89"],
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);

  // Stamp times accelerate: t(x) = x^0.7.
  const stampAt = (i: number) => Math.round(stampStart + (stampEnd - stampStart) * Math.pow(i / Math.max(1, count - 1), 0.7));
  const landed = Array.from({ length: count }, (_, i) => stampAt(i)).filter((t) => frame >= t + 2).length;
  // Each landing jolts the grid.
  const lastStamp = Array.from({ length: count }, (_, i) => stampAt(i)).filter((t) => t <= frame).pop();
  const since = lastStamp === undefined ? 99 : frame - lastStamp;
  const jolt = since < 8 ? Math.sin(since * 2.2) * 6 * (1 - since / 8) : 0;

  const rows = Math.ceil(count / cols);
  const gridW = cols * iconSize + (cols - 1) * gap;
  const gridH = rows * iconSize + (rows - 1) * gap;
  const done = landed >= count;
  const counterPop = done ? pop(frame, fps, stampAt(count - 1) + 2) : 1;

  return (
    <div style={{ width: gridW, display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
      {/* Counter */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 22, transform: `scale(${interpolate(counterPop, [0, 1], [1.3, 1])})` }}>
        <span style={{ fontFamily: fonts.headline, fontSize: 190, lineHeight: 0.9, color: done ? colors.red : colors.cream, minWidth: 190, textAlign: "right", fontVariantNumeric: "tabular-nums", textShadow: `8px 8px 0 ${colors.ink}` }}>
          {landed}
        </span>
        <span style={{ fontFamily: fonts.headline, fontSize: 76, color: colors.cream, letterSpacing: 2 }}>{label}</span>
      </div>
      {/* Grid */}
      <div style={{ position: "relative", width: gridW, height: gridH, transform: `translateY(${jolt}px)` }}>
        {Array.from({ length: count }, (_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const inRow = r === rows - 1 ? count - r * cols : cols;
          const rowOffset = ((cols - inRow) * (iconSize + gap)) / 2;
          const x = rowOffset + c * (iconSize + gap);
          const y = r * (iconSize + gap);
          const appear = pop(frame, fps, appearAt + i * 1.5);
          const t = stampAt(i);
          const stamped = frame >= t;
          const s = stamped ? slam(frame, fps, t) : 0;
          const grey = interpolate(frame, [t + 2, t + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const bg = iconColors[i % iconColors.length];
          const glyph = GLYPHS[(i * 5) % GLYPHS.length];
          const float = Math.sin((frame + i * 9) / 18) * 3 * (1 - grey);
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, width: iconSize, height: iconSize, transform: `scale(${appear}) translateY(${float}px)` }}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: iconSize * 0.24,
                  background: `linear-gradient(160deg, ${bg}, ${shade(bg, 0.25)})`,
                  boxShadow: `0 8px 0 ${alpha(colors.ink, 0.6)}`,
                  filter: failFilter(grey),
                  opacity: 1 - grey * 0.35,
                }}
              >
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  <GlyphShape g={glyph} c={colors.cream} />
                </svg>
              </div>
              {stamped ? (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -50%) scale(${interpolate(s, [0, 1], [2.6, 1])}) rotate(${-14 + (i % 3) * 5}deg)`,
                    opacity: interpolate(frame - t, [0, 2], [0, 1], { extrapolateRight: "clamp" }),
                    border: `5px solid ${colors.red}`,
                    borderRadius: 10,
                    padding: "4px 8px 2px",
                    fontFamily: fonts.headline,
                    fontSize: iconSize * 0.2,
                    lineHeight: 1,
                    color: colors.red,
                    background: alpha(colors.cream, 0.92),
                    whiteSpace: "pre",
                    textAlign: "center",
                    letterSpacing: 1,
                  }}
                >
                  {stampText}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
