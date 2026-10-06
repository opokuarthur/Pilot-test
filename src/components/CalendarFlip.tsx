// CalendarFlip: split-flap year display. Give it keyframes like
//   years={[{ at: 0, year: 2026 }, { at: 150, year: 2018 }, { at: 500, year: 2015 }]}
// and it riffles through every year in between, flipping only the digits that
// change, then lands with a small bounce.
import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pop } from "../lib/motion";
import { alpha, shade } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type CalendarFlipProps = ThemableProps & {
  years: { at: number; year: number }[];
  /** Frames each year-to-year riffle takes. */
  flipFrames?: number;
  /** Frames a single digit flap takes. */
  flapFrames?: number;
  /** Digit card size in px. */
  digitWidth?: number;
  digitHeight?: number;
  cardColor?: string;
  digitColor?: string;
  label?: string;
};

const yearAt = (frame: number, years: { at: number; year: number }[], flipFrames: number) => {
  let y = years[0].year;
  for (let i = 1; i < years.length; i++) {
    const k = years[i];
    if (frame >= k.at) {
      const p = interpolate(frame, [k.at, k.at + flipFrames], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
      y = Math.round(years[i - 1].year + (k.year - years[i - 1].year) * p);
    }
  }
  return y;
};

const Half: React.FC<{ digit: string; half: "top" | "bottom"; w: number; h: number; bg: string; fg: string; font: string; style?: React.CSSProperties }> = ({
  digit,
  half,
  w,
  h,
  bg,
  fg,
  font,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: half === "top" ? 0 : h / 2,
      width: w,
      height: h / 2,
      overflow: "hidden",
      background: half === "top" ? bg : shade(bg, 0.12),
      borderRadius: half === "top" ? `${w * 0.12}px ${w * 0.12}px 0 0` : `0 0 ${w * 0.12}px ${w * 0.12}px`,
      backfaceVisibility: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: half === "top" ? 0 : -h / 2,
        width: w,
        height: h,
        lineHeight: `${h}px`,
        textAlign: "center",
        fontFamily: font,
        fontSize: h * 0.78,
        color: fg,
      }}
    >
      {digit}
    </div>
  </div>
);

export const CalendarFlip: React.FC<CalendarFlipProps> = ({
  years,
  flipFrames = 40,
  flapFrames = 5,
  digitWidth = 150,
  digitHeight = 220,
  cardColor,
  digitColor,
  label = "YEAR",
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  const bg = cardColor ?? colors.ink;
  const fg = digitColor ?? colors.cream;

  const now = String(yearAt(frame, years, flipFrames));
  // Find the most recent change so we can animate the flap.
  let changeAt = -1;
  for (let f = frame; f > frame - flapFrames - 1 && f > 0; f--) {
    if (yearAt(f, years, flipFrames) !== yearAt(f - 1, years, flipFrames)) {
      changeAt = f;
      break;
    }
  }
  const prev = changeAt >= 0 ? String(yearAt(changeAt - 1, years, flipFrames)) : now;
  const p = changeAt >= 0 ? Math.min(1, (frame - changeAt) / flapFrames) : 1;

  // Bounce when a riffle lands.
  const landed = years.slice(1).filter((k) => frame >= k.at + flipFrames).pop();
  const bounce = landed ? interpolate(pop(frame, fps, landed.at + flipFrames), [0, 1], [1.12, 1]) : 1;
  const w = digitWidth;
  const h = digitHeight;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, transform: `scale(${bounce})` }}>
      <div style={{ fontFamily: fonts.body, fontWeight: 800, fontSize: h * 0.13, letterSpacing: 8, color: alpha(colors.cream, 0.7) }}>{label}</div>
      <div style={{ display: "flex", gap: w * 0.08 }}>
        {now.split("").map((d, i) => {
          const old = prev[i] ?? d;
          const flipping = old !== d && p < 1;
          return (
            <div key={i} style={{ position: "relative", width: w, height: h, perspective: 900, boxShadow: `0 ${h * 0.05}px 0 ${alpha("#000000", 0.35)}`, borderRadius: w * 0.12 }}>
              <Half digit={d} half="top" w={w} h={h} bg={bg} fg={fg} font={fonts.headline} />
              <Half digit={flipping ? old : d} half="bottom" w={w} h={h} bg={bg} fg={fg} font={fonts.headline} />
              {flipping && p < 0.5 ? (
                <Half digit={old} half="top" w={w} h={h} bg={bg} fg={fg} font={fonts.headline} style={{ transformOrigin: "50% 100%", transform: `rotateX(${-p * 180}deg)` }} />
              ) : null}
              {flipping && p >= 0.5 ? (
                <Half digit={d} half="bottom" w={w} h={h} bg={bg} fg={fg} font={fonts.headline} style={{ transformOrigin: "50% 0%", transform: `rotateX(${(1 - p) * 180}deg)` }} />
              ) : null}
              {/* Hinge line */}
              <div style={{ position: "absolute", left: 0, right: 0, top: h / 2 - 2, height: 4, background: alpha("#000000", 0.5) }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
