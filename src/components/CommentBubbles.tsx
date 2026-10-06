// CommentBubbles: social-media-style comments popping in, each with a generic
// avatar (abstract head shape, deterministic colours), a grey placeholder bar
// instead of a username (never real names), the comment text and a like
// count. `sweepAt` sends every bubble flying off to one side.
//   items={[{ text: "5,000?? 😂", at: 10, x: 120, y: 300 }, …]}
// `floodComments()` builds a scattered, staggered layout from a list of texts.
import React from "react";
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type CommentItem = {
  text: string;
  /** Frame it pops in. */
  at: number;
  /** Top-left position in px (within the parent). */
  x: number;
  y: number;
  /** Tilt in degrees. */
  rotate?: number;
  likes?: number;
  /** Seed for the avatar look. */
  seed?: string;
};

export type CommentBubblesProps = ThemableProps & {
  items: CommentItem[];
  fontSize?: number;
  maxWidth?: number;
  /** Frame all bubbles are swept away. */
  sweepAt?: number;
  sweepDirection?: "left" | "right";
  bubbleColor?: string;
  textColor?: string;
};

/** Rough rendered width of a bubble (avatar + text + heart + padding). */
export const bubbleWidth = (text: string, fontSize = 46) => fontSize * (0.6 * Array.from(text).length + 3.6);

/**
 * Scatter `texts` down a box, staggered in time (each gap × accel), deterministically.
 * Bubbles are kept fully inside the box horizontally.
 */
export const floodComments = (
  texts: string[],
  opts: { start: number; interval: number; accel?: number; box: { left: number; top: number; width: number; height: number }; fontSize?: number; seed?: string },
): CommentItem[] => {
  const { start, interval, accel = 1, box, fontSize = 46, seed = "flood" } = opts;
  const items: CommentItem[] = [];
  let t = start;
  let gap = interval;
  const rows = texts.length;
  texts.forEach((text, i) => {
    const r = (k: string) => random(`${seed}-${k}-${i}`);
    const free = Math.max(0, box.width - bubbleWidth(text, fontSize));
    // Alternate sides so neighbours don't stack in the same column.
    const side = i % 2 ? 0.55 + r("x") * 0.45 : r("x") * 0.45;
    items.push({
      text,
      at: Math.round(t),
      x: box.left + side * free,
      y: box.top + ((i * 5) % rows) / Math.max(1, rows - 1) * box.height + (r("y") - 0.5) * 24,
      rotate: (r("r") - 0.5) * 7,
      likes: Math.floor(r("l") * 900) + 12,
      seed: `${seed}${i}`,
    });
    t += gap;
    gap = Math.max(2, gap * accel);
  });
  return items;
};

const Avatar: React.FC<{ size: number; seed: string; palette: string[]; skins: string[] }> = ({ size, seed, palette, skins }) => {
  const bg = palette[Math.floor(random(`${seed}bg`) * palette.length)];
  const skin = skins[Math.floor(random(`${seed}sk`) * skins.length)];
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ flexShrink: 0 }}>
      <clipPath id={`av${seed.replace(/[^a-zA-Z0-9]/g, "")}`}>
        <circle cx={30} cy={30} r={30} />
      </clipPath>
      <g clipPath={`url(#av${seed.replace(/[^a-zA-Z0-9]/g, "")})`}>
        <rect width={60} height={60} fill={bg} />
        {/* Abstract head + shoulders, no face */}
        <circle cx={30} cy={25} r={11} fill={skin} />
        <path d="M8 62 C10 44 50 44 52 62 Z" fill={shade(bg, 0.35)} />
      </g>
    </svg>
  );
};

const Heart: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 21 C6 16 2 12.5 2 8.5 A4.8 4.8 0 0 1 12 6 A4.8 4.8 0 0 1 22 8.5 C22 12.5 18 16 12 21 Z" fill={color} />
  </svg>
);

export const CommentBubbles: React.FC<CommentBubblesProps> = ({
  items,
  fontSize = 46,
  maxWidth = 640,
  sweepAt,
  sweepDirection = "left",
  bubbleColor,
  textColor,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const { colors, fonts, outfitColors, skinTones } = useTheme(themable);
  const bubble = bubbleColor ?? colors.cream;
  const text = textColor ?? colors.ink;
  const dir = sweepDirection === "left" ? -1 : 1;

  return (
    <>
      {items.map((c, i) => {
        if (frame < c.at) return null;
        const p = spring({ frame: frame - c.at, fps, config: { damping: 11, mass: 0.5, stiffness: 190 } });
        let sx = 0;
        let sr = 0;
        let so = 1;
        if (sweepAt !== undefined && frame >= sweepAt) {
          const s = interpolate(frame, [sweepAt + (i % 6) * 1.5, sweepAt + (i % 6) * 1.5 + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.in(Easing.cubic),
          });
          sx = dir * s * (width + 400);
          sr = dir * s * 25;
          so = 1 - s * 0.3;
          if (s >= 1) return null;
        }
        const drift = Math.sin((frame + i * 17) / 30) * 4;
        const likes = c.likes ?? 0;
        const likeNow = Math.round(likes * interpolate(frame - c.at, [6, 50], [0.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x,
              top: c.y,
              maxWidth,
              transform: `translate(${sx}px, ${drift}px) rotate(${(c.rotate ?? 0) + sr}deg) scale(${p})`,
              transformOrigin: "0% 50%",
              opacity: so * Math.min(1, p * 2),
              display: "flex",
              alignItems: "flex-start",
              gap: fontSize * 0.3,
              padding: `${fontSize * 0.32}px ${fontSize * 0.45}px`,
              background: bubble,
              borderRadius: fontSize * 0.55,
              boxShadow: `${fontSize * 0.12}px ${fontSize * 0.12}px 0 ${colors.ink}`,
              fontFamily: fonts.body,
            }}
          >
            <Avatar size={fontSize * 1.25} seed={c.seed ?? `c${i}`} palette={outfitColors} skins={skinTones} />
            <div style={{ display: "flex", flexDirection: "column", gap: fontSize * 0.12 }}>
              {/* Placeholder username bar — never a real name */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: fontSize * (2 + random(`${c.seed}n`) * 1.6), height: fontSize * 0.28, borderRadius: 8, background: tint(colors.grey, 0.35) }} />
                <div style={{ width: fontSize * 0.7, height: fontSize * 0.22, borderRadius: 8, background: tint(colors.grey, 0.6) }} />
              </div>
              <div style={{ fontWeight: 800, fontSize, lineHeight: 1.1, color: text, whiteSpace: "nowrap" }}>{c.text}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: fontSize * 0.15, marginTop: fontSize * 0.1 }}>
              <Heart size={fontSize * 0.6} color={colors.red} />
              <div style={{ fontWeight: 700, fontSize: fontSize * 0.36, color: colors.grey }}>{likeNow}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};
