// Sideline: a touchline at a stadium. The #7 player silhouette (training
// bib) warms up on the near side: jogging back and forth, or stretching. He
// always stays on our side of the white line: the pitch is never entered.
// Small generic players move on the pitch behind, and floodlight glow sits
// at the top.
//   action={[{ at: 0, value: "jog" }, { at: 90, value: "stretch" }, { at: 160, value: "idle" }]}
import React from "react";
import { random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Animatable, resolveKeyframes } from "../lib/keyframes";
import { PersonFigure, Pose } from "./Person";
import { playerLook } from "./Silhouettes";
import { alpha, shade } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type SidelineAction = "jog" | "stretch" | "idle";

export type SidelineProps = ThemableProps & {
  width?: number;
  height?: number;
  action?: Animatable<SidelineAction>;
  /** Jogging range as fractions of the width. */
  range?: [number, number];
  /** Player height in px. */
  playerHeight?: number;
  appearAt?: number;
  /** 0–1: dims the pitch players (e.g. after the final whistle). */
  pitchDim?: number;
};

const STRETCH: Pose[] = ["cheer", "shrug", "reach", "cheer", "idle"];

export const Sideline: React.FC<SidelineProps> = ({
  width = 1080,
  height = 700,
  action = "jog",
  range = [0.18, 0.72],
  playerHeight = 380,
  appearAt = 0,
  pitchDim = 0,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  const W = width;
  const H = height;
  const lineY = H * 0.5;
  const inP = spring({ frame: frame - appearAt, fps, config: { damping: 14, mass: 0.8 } });

  // Integrate jogging distance so switching actions never makes him jump.
  let dist = 0;
  for (let f = appearAt; f < frame; f++) {
    if (resolveKeyframes(action, f, 1).to === "jog") dist += 7;
  }
  const span = (range[1] - range[0]) * W;
  const cyc = dist % (2 * span);
  const goingRight = cyc < span;
  const x = range[0] * W + (goingRight ? cyc : 2 * span - cyc);
  const mode = resolveKeyframes(action, frame, 1).to;
  const pose: Pose = mode === "stretch" ? STRETCH[Math.floor(frame / 24) % STRETCH.length] : "idle";
  const ps = playerHeight / 430;
  // Feet stay well below the touchline.
  const feetY = lineY + 40 + playerHeight * 0.9;

  return (
    <svg width={W} height={H + playerHeight} viewBox={`0 0 ${W} ${H + playerHeight}`} style={{ overflow: "visible", opacity: inP }}>
      {/* Pitch with mown stripes */}
      <defs>
        <linearGradient id="pitchFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#123B27" />
          <stop offset="1" stopColor="#1D5A3A" />
        </linearGradient>
      </defs>
      <rect x={-60} y={0} width={W + 120} height={lineY} fill="url(#pitchFade)" />
      {Array.from({ length: 7 }, (_, k) => (
        <rect key={k} x={-60} y={(k * lineY) / 7} width={W + 120} height={lineY / 14} fill="#000" opacity={0.08} />
      ))}
      {/* Players on the pitch (generic, small, far) */}
      <g opacity={0.75 * (1 - pitchDim)}>
        {Array.from({ length: 7 }, (_, k) => {
          const px = (((random(`pp${k}`) * W + frame * (2 + (k % 3)) * (k % 2 ? 1 : -1)) % W) + W) % W;
          const py = lineY * (0.25 + 0.6 * random(`py${k}`));
          const sc = 0.12 + 0.12 * (py / lineY);
          return (
            <g key={k} transform={`translate(${px} ${py}) scale(${sc})`}>
              <PersonFigure silhouette={k % 2 ? shade(colors.red, 0.3) : "#E8E8E8"} walk={10} seed={k} />
            </g>
          );
        })}
      </g>
      {/* Touchline */}
      <rect x={-60} y={lineY - 6} width={W + 120} height={12} fill={colors.cream} />
      {/* Near side: track/apron */}
      <rect x={-60} y={lineY + 6} width={W + 120} height={H + playerHeight} fill={shade("#2B3448", 0.15)} />
      <rect x={-60} y={lineY + 6} width={W + 120} height={26} fill={alpha("#000000", 0.25)} />
      {/* Cones marking the warm-up channel */}
      {[range[0] - 0.06, range[1] + 0.12].map((f) => (
        <g key={f} transform={`translate(${f * W} ${feetY - 4})`}>
          <path d="M-22 0 L-6 -52 L6 -52 L22 0 Z" fill={colors.gold} />
          <rect x={-28} y={-4} width={56} height={8} rx={3} fill={shade(colors.gold, 0.3)} />
        </g>
      ))}
      {/* Label on the apron */}
      <text x={W - 40} y={lineY + 80} textAnchor="end" fontFamily={fonts.body} fontWeight={800} fontSize={28} letterSpacing={6} fill={alpha(colors.cream, 0.4)}>
        WARM-UP AREA
      </text>
      {/* The player */}
      <g transform={`translate(${x - 100 * ps} ${feetY - 400 * ps}) scale(${ps})`}>
        <PersonFigure {...playerLook(colors, fonts.headline, { bib: true })} pose={pose} walk={mode === "jog" ? 12 : 0} flip={!goingRight} blendFrames={6} />
      </g>
      <ellipse cx={x} cy={feetY + 4} rx={60} ry={10} fill="#000" opacity={0.2} />
      {/* Floodlight haze */}
      <rect x={-60} y={-200} width={W + 120} height={260} fill={alpha(colors.cream, 0.04)} />
    </svg>
  );
};
