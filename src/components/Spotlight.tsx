// Spotlight: a stage spotlight beam from above. Everything outside the beam
// is dimmed (so the side the beam leaves goes dark), and the beam can swing
// from `fromX` to `toX` with an overshoot. Dust motes drift in the light and
// a pool of light sits on the floor. Full-frame overlay: put it above the
// scene art and below text.
import React from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type SpotlightProps = ThemableProps & {
  fromX?: number;
  toX?: number;
  swingAt?: number;
  appearAt?: number;
  exitAt?: number;
  /** Light source (above the frame) and the floor the beam lands on. */
  sourceY?: number;
  floorY?: number;
  /** Beam width at the floor. */
  beamWidth?: number;
  /** Darkness outside the beam (0–1). */
  dim?: number;
  color?: string;
};

export const Spotlight: React.FC<SpotlightProps> = ({
  fromX = 270,
  toX = 810,
  swingAt,
  appearAt = 0,
  exitAt,
  sourceY = -160,
  floorY = 1250,
  beamWidth = 560,
  dim = 0.62,
  color,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { colors } = useTheme(themable);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  if (frame < appearAt) return null;
  const c = color ?? "#FFF1C9";
  const on = interpolate(frame, [appearAt, appearAt + 3, appearAt + 5, appearAt + 9], [0, 1, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const off = exitAt === undefined ? 1 : interpolate(frame, [exitAt, exitAt + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const k = on * off;
  if (k <= 0) return null;
  const sw = swingAt === undefined || frame < swingAt ? 0 : spring({ frame: frame - swingAt, fps, config: { damping: 11, mass: 1.1, stiffness: 60 } });
  const x = fromX + (toX - fromX) * sw;
  const srcX = width / 2;
  const half = beamWidth / 2;
  const cone = `M${srcX - 20} ${sourceY} L${srcX + 20} ${sourceY} L${x + half} ${floorY} L${x - half} ${floorY} Z`;
  const flicker = 0.92 + 0.08 * Math.sin(frame / 3.3) * Math.sin(frame / 7.1);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <defs>
        <linearGradient id={`beam${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c} stopOpacity={0.55} />
          <stop offset="1" stopColor={c} stopOpacity={0.12} />
        </linearGradient>
        <filter id={`soft${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={18} />
        </filter>
        <mask id={`hole${uid}`}>
          <rect width={width} height={height} fill="#fff" />
          <path d={cone} fill="#000" filter={`url(#soft${uid})`} />
          <ellipse cx={x} cy={floorY} rx={half * 1.05} ry={70} fill="#000" filter={`url(#soft${uid})`} />
        </mask>
      </defs>
      {/* Dim everything outside the beam */}
      <rect width={width} height={height} fill="#000" opacity={dim * k} mask={`url(#hole${uid})`} />
      {/* Beam + floor pool */}
      <g opacity={k * flicker} style={{ mixBlendMode: "screen" }}>
        <path d={cone} fill={`url(#beam${uid})`} filter={`url(#soft${uid})`} />
        <ellipse cx={x} cy={floorY} rx={half} ry={60} fill={alpha(c, 0.35)} filter={`url(#soft${uid})`} />
        {Array.from({ length: 22 }, (_, i) => {
          const ty = (random(`my${i}`) * 0.9 + 0.05 + ((frame * 0.0015 * (1 + (i % 3))) % 1)) % 1;
          const yy = sourceY + (floorY - sourceY) * ty;
          const spread = (half * (yy - sourceY)) / (floorY - sourceY);
          const xx = srcX + (x - srcX) * ty + (random(`mx${i}`) - 0.5) * 2 * spread * 0.8;
          return <circle key={i} cx={xx} cy={yy} r={2 + random(`mr${i}`) * 3} fill={c} opacity={0.5} />;
        })}
      </g>
      {/* Lamp housing peeking in at the top */}
      <g transform={`translate(${srcX} 0) rotate(${(Math.atan2(x - srcX, floorY - sourceY) * -180) / Math.PI})`}>
        <rect x={-46} y={-60} width={92} height={70} rx={14} fill={colors.ink} />
        <ellipse cx={0} cy={10} rx={40} ry={10} fill={c} opacity={k} />
      </g>
    </svg>
  );
};
