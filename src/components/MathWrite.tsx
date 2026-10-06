// MathWrite: equations that write themselves out, character by character,
// one line (step) after another, with a gold "pen" caret at the writing
// position and an optional marker underline once a line is finished.
//   lines={[
//     { text: "5,000 ÷ 8 hrs = *625 / hr*", at: 0 },
//     { text: "= *1 plate every 6 sec*", at: 70, underline: true },
//   ]}
// *stars* mark the highlighted (gold) part. "→" is drawn as a vector arrow so
// it never depends on font coverage.
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type MathLine = {
  text: string;
  /** Frame the line starts writing. */
  at: number;
  /** Frames per character (default from the component). */
  charFrames?: number;
  fontSize?: number;
  color?: string;
  /** Sweep a marker underline under the line when it finishes. */
  underline?: boolean;
  /** Frame this line disappears. */
  exitAt?: number;
};

export type MathWriteProps = ThemableProps & {
  lines: MathLine[];
  fontSize?: number;
  charFrames?: number;
  /** Vertical gap between lines, as a multiple of fontSize. */
  lineGap?: number;
  color?: string;
  highlightColor?: string;
  /** Frame the whole block disappears. */
  exitAt?: number;
  font?: string;
  width?: number;
};

type Glyph = { ch: string; hl: boolean };

const parse = (text: string): Glyph[] => {
  const out: Glyph[] = [];
  let hl = false;
  for (const ch of Array.from(text)) {
    if (ch === "*") {
      hl = !hl;
      continue;
    }
    out.push({ ch, hl });
  }
  return out;
};

const Arrow: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size * 0.9} height={size * 0.6} viewBox="0 0 90 60" style={{ display: "inline-block", verticalAlign: "middle", margin: `0 ${size * 0.08}px`, overflow: "visible" }}>
    <path d="M6 30 H74 M52 10 L78 30 L52 50" stroke={color} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MathWrite: React.FC<MathWriteProps> = ({
  lines,
  fontSize = 88,
  charFrames = 1.5,
  lineGap = 1.25,
  color,
  highlightColor,
  exitAt,
  font,
  width = 880,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { colors, fonts } = useTheme(themable);
  const blockOut =
    exitAt === undefined ? 1 : interpolate(frame, [exitAt, exitAt + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (blockOut <= 0) return null;
  const ink = color ?? colors.cream;
  const hlc = highlightColor ?? colors.gold;

  return (
    <div style={{ width, opacity: blockOut, transform: `translateY(${(1 - blockOut) * -20}px)` }}>
      {lines.map((line, li) => {
        const size = line.fontSize ?? fontSize;
        const cf = line.charFrames ?? charFrames;
        const glyphs = parse(line.text);
        const lineOut =
          line.exitAt === undefined ? 1 : interpolate(frame, [line.exitAt, line.exitAt + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const written = (frame - line.at) / cf;
        const done = written >= glyphs.length;
        const finishedAt = line.at + glyphs.length * cf;
        const under = line.underline
          ? interpolate(frame, [finishedAt + 4, finishedAt + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) })
          : 0;
        return (
          <div
            key={li}
            style={{
              position: "relative",
              height: size * lineGap,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              opacity: lineOut,
              visibility: frame < line.at || lineOut <= 0 ? "hidden" : "visible",
            }}
          >
            <div style={{ position: "relative", whiteSpace: "pre", fontFamily: font ?? fonts.headline, fontSize: size, lineHeight: 1, color: line.color ?? ink, letterSpacing: 1 }}>
              {under > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    left: -size * 0.1,
                    bottom: -size * 0.08,
                    height: size * 0.2,
                    width: `calc(${under * 100}% + ${size * 0.2 * under}px)`,
                    background: hlc,
                    opacity: 0.85,
                    borderRadius: size * 0.1,
                    transform: "rotate(-1deg)",
                  }}
                />
              ) : null}
              {glyphs.map((g, i) => {
                const t = written - i;
                if (t < 0) return (
                  <span key={i} style={{ opacity: 0 }}>
                    {g.ch === "→" ? <Arrow size={size} color={ink} /> : g.ch}
                  </span>
                );
                const k = Math.min(1, t / 3);
                const e = Easing.out(Easing.back(2))(k);
                const c = g.hl ? hlc : line.color ?? ink;
                return (
                  <span
                    key={i}
                    style={{
                      position: "relative",
                      display: "inline-block",
                      color: c,
                      opacity: Math.min(1, k * 2),
                      transform: `translateY(${(1 - e) * size * 0.25}px) scale(${0.6 + 0.4 * e})`,
                      textShadow: `${size * 0.04}px ${size * 0.04}px 0 ${colors.ink}`,
                    }}
                  >
                    {g.ch === "→" ? <Arrow size={size} color={c} /> : g.ch}
                    {!done && i === Math.floor(written) - 1 ? (
                      // Pen caret right after the newest character.
                      <span
                        style={{
                          position: "absolute",
                          top: size * 0.05,
                          right: -size * 0.1,
                          width: size * 0.07,
                          height: size * 0.9,
                          background: hlc,
                          borderRadius: size * 0.04,
                          boxShadow: `0 0 ${size * 0.25}px ${hlc}`,
                        }}
                      />
                    ) : null}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
