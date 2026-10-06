// PhotoCutout: shows a transparent-background photo cutout as a "sticker":
// natural colour with a subtle warm grade, a thick border that follows the
// cutout's shape, and a soft drop shadow, all done with one SVG filter on
// the image (no extra image files). Optional overshoot pop-in and gentle float.
//   <PhotoCutout src={staticFile("assets/x.png")} aspect={1167 / 757} width={600} />
// The photo is never flipped or distorted: width and height always follow `aspect`.
import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type PhotoCutoutProps = ThemableProps & {
  src: string;
  /** Natural width ÷ height of the image. */
  aspect: number;
  /** Rendered width in px (border and shadow are added outside it). */
  width?: number;
  /** Sticker border thickness in px (0 = none). */
  border?: number;
  borderColor?: string;
  /** Warm grade strength, 0 = untouched colour, 1 = noticeably warm. */
  warmth?: number;
  /** Drop shadow: blur radius, offset and opacity. */
  shadow?: { blur: number; x: number; y: number; opacity: number } | null;
  /** Frame it pops in (undefined = always visible, no entrance). */
  appearAt?: number;
  /** Float amplitude in px (0 = still). */
  float?: number;
  style?: React.CSSProperties;
};

export const PhotoCutout: React.FC<PhotoCutoutProps> = ({
  src,
  aspect,
  width = 500,
  border = 14,
  borderColor,
  warmth = 0.3,
  shadow = { blur: 14, x: 8, y: 14, opacity: 0.45 },
  appearAt,
  float = 0,
  style,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme(themable);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  if (appearAt !== undefined && frame < appearAt) return null;

  const height = width / aspect;
  const pop = appearAt === undefined ? 1 : spring({ frame: frame - appearAt, fps, config: { damping: 10, mass: 0.6, stiffness: 150 } });
  const fade = appearAt === undefined ? 1 : interpolate(frame - appearAt, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const bob = float ? Math.sin(frame / 28) * float : 0;
  const tilt = float ? Math.sin(frame / 41 + 1) * 0.6 : 0;
  const w = warmth;
  // Subtle warm grade: a touch more red, a touch less blue, tiny lift.
  const grade = [1 + 0.06 * w, 0, 0, 0, 0.015 * w, 0, 1 + 0.01 * w, 0, 0, 0.005 * w, 0, 0, 1 - 0.08 * w, 0, 0, 0, 0, 0, 1, 0].join(" ");
  const pad = border + (shadow ? shadow.blur * 2 + Math.max(Math.abs(shadow.x), Math.abs(shadow.y)) : 0);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        transform: `translateY(${bob}px) rotate(${tilt}deg) scale(${pop})`,
        opacity: fade,
        ...style,
      }}
    >
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter
          id={`sticker${uid}`}
          x={-pad / width}
          y={-pad / height}
          width={1 + (2 * pad) / width}
          height={1 + (2 * pad) / height}
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix in="SourceGraphic" type="matrix" values={grade} result="graded" />
          {/* Border: grow the alpha, round it off (blur + re-threshold), fill with the border colour. */}
          <feMorphology in="SourceAlpha" operator="dilate" radius={border} result="grown" />
          <feGaussianBlur in="grown" stdDeviation={Math.max(0.5, border * 0.35)} result="grownBlur" />
          <feComponentTransfer in="grownBlur" result="grownRound">
            <feFuncA type="linear" slope={6} intercept={-2.2} />
          </feComponentTransfer>
          <feFlood floodColor={borderColor ?? colors.cream} result="borderFill" />
          <feComposite in="borderFill" in2="grownRound" operator="in" result="sticker" />
          {shadow ? (
            <>
              <feGaussianBlur in="grownRound" stdDeviation={shadow.blur} result="shadowBlur" />
              <feOffset in="shadowBlur" dx={shadow.x} dy={shadow.y} result="shadowOff" />
              <feFlood floodColor="#000" floodOpacity={shadow.opacity} result="shadowFill" />
              <feComposite in="shadowFill" in2="shadowOff" operator="in" result="shadow" />
            </>
          ) : null}
          <feMerge>
            {shadow ? <feMergeNode in="shadow" /> : null}
            {border > 0 ? <feMergeNode in="sticker" /> : null}
            <feMergeNode in="graded" />
          </feMerge>
        </filter>
      </svg>
      <Img src={src} style={{ width, height, display: "block", filter: `url(#sticker${uid})` }} />
    </div>
  );
};
