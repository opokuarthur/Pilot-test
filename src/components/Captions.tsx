// Captions: sentence-level captions in the bottom third (above the TikTok /
// Shorts UI). Inter bold, cream with a dark outline; words wrapped in *stars*
// are highlighted gold. Long sentences are split into balanced lines of at
// most `maxWordsPerLine` words.
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pop } from "../lib/motion";
import { ThemableProps, useTheme } from "../lib/theme-context";
import { CAPTION_ZONE } from "../config/layout";

export type CaptionChunk = { start: number; end: number; text: string };

export type CaptionsProps = ThemableProps & {
  chunks: CaptionChunk[];
  /** Vertical centre of the caption block in px. */
  y?: number;
  fontSize?: number;
  maxWordsPerLine?: number;
  maxWidth?: number;
  highlightColor?: string;
};

const toLines = <T,>(words: T[], max: number): T[][] => {
  const lineCount = Math.ceil(words.length / max);
  const per = Math.ceil(words.length / lineCount);
  const lines: T[][] = [];
  for (let i = 0; i < words.length; i += per) lines.push(words.slice(i, i + per));
  return lines;
};

export const Captions: React.FC<CaptionsProps> = ({
  chunks,
  y = (CAPTION_ZONE.top + CAPTION_ZONE.bottom) / 2,
  fontSize = 58,
  maxWordsPerLine = 6,
  maxWidth = 900,
  highlightColor,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  const chunk = chunks.find((c) => frame >= c.start && frame < c.end);
  if (!chunk) return null;

  const p = pop(frame, fps, chunk.start);
  const out = interpolate(frame, [chunk.end - 5, chunk.end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Track highlight state across words: "*thousands of Ghanaians*" spans words.
  let on = false;
  const words = chunk.text.split(/\s+/).map((w) => {
    const startsOn = w.startsWith("*");
    const endsOn = w.replace(/[.,!?:;'"…]+$/, "").endsWith("*");
    if (startsOn) on = true;
    const hl = on;
    if (endsOn) on = false;
    return { text: w.replace(/\*/g, ""), hl };
  });
  const lines = toLines(words, maxWordsPerLine);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: y,
        width: maxWidth,
        transform: `translate(-50%, -50%) translateY(${(1 - p) * 24}px) scale(${0.94 + 0.06 * p})`,
        opacity: Math.min(1, p * 2) * out,
        textAlign: "center",
        fontFamily: fonts.body,
        fontWeight: 800,
        fontSize,
        lineHeight: 1.18,
        color: colors.cream,
        WebkitTextStroke: `${fontSize * 0.16}px ${colors.ink}`,
        paintOrder: "stroke fill",
        textShadow: `0 ${fontSize * 0.08}px ${fontSize * 0.2}px rgba(0,0,0,0.45)`,
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ textWrap: "balance" } as React.CSSProperties}>
          {line.map((w, j) => (
            <span key={j} style={{ color: w.hl ? highlightColor ?? colors.gold : undefined }}>
              {w.text}
              {j < line.length - 1 ? " " : ""}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};
