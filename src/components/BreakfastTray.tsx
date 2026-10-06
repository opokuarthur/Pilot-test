// BreakfastTray: a top-down hotel breakfast tray (main plate, side plate,
// bowl, cup, cutlery). With rows × cols > 1 it multiplies into a grid: the
// first ("hero") tray starts big in the middle, shrinks into its grid cell at
// `multiplyAt`, then the rest pop in rippling outward from it.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type BreakfastTrayProps = ThemableProps & {
  cols?: number;
  rows?: number;
  /** Width of one tray in the grid (px). Height = 0.72 × width. */
  cellWidth?: number;
  gap?: number;
  /** Scale of the hero tray before it multiplies. */
  heroScale?: number;
  appearAt?: number;
  /** Frame the hero shrinks and the grid fills. */
  multiplyAt?: number;
  /** Frames between rings of the ripple. */
  stagger?: number;
  trayColor?: string;
  plateColor?: string;
  rimColor?: string;
};

/** One tray in a 300×216 box. */
export const TrayArt: React.FC<{ tray: string; plate: string; rim: string; colors: { gold: string; red: string; cream: string; ink: string } }> = ({ tray, plate, rim, colors }) => (
  <g>
    <rect x={4} y={8} width={292} height={204} rx={22} fill={shade(tray, 0.35)} />
    <rect x={0} y={0} width={292} height={204} rx={22} fill={tray} />
    <rect x={10} y={10} width={272} height={184} rx={16} fill={tint(tray, 0.08)} />
    {/* Main plate: egg, toast, sausage */}
    <circle cx={100} cy={104} r={74} fill={shade(plate, 0.12)} />
    <circle cx={100} cy={100} r={74} fill={plate} />
    <circle cx={100} cy={100} r={66} fill="none" stroke={rim} strokeWidth={3} />
    <circle cx={100} cy={100} r={48} fill={shade(plate, 0.05)} />
    <path d="M62 86 C60 66 92 62 100 74 C114 64 132 78 124 96 C132 110 108 124 94 116 C76 124 56 106 62 86 Z" fill="#FFFDF6" />
    <circle cx={94} cy={92} r={14} fill={colors.gold} />
    <rect x={70} y={112} width={46} height={34} rx={6} fill="#C98B48" transform="rotate(-12 93 129)" />
    <rect x={74} y={116} width={38} height={26} rx={4} fill="#E2B074" transform="rotate(-12 93 129)" />
    <rect x={114} y={106} width={44} height={16} rx={8} fill="#8A4A2B" transform="rotate(30 136 114)" />
    {/* Side plate with a roll */}
    <circle cx={222} cy={58} r={40} fill={shade(plate, 0.12)} />
    <circle cx={222} cy={55} r={40} fill={plate} />
    <circle cx={222} cy={55} r={34} fill="none" stroke={rim} strokeWidth={2.5} />
    <ellipse cx={222} cy={55} rx={20} ry={14} fill="#D9A15A" />
    <path d="M208 52 Q222 44 236 52" stroke="#B57A37" strokeWidth={3} fill="none" />
    {/* Bowl with porridge */}
    <circle cx={222} cy={150} r={38} fill={shade(plate, 0.15)} />
    <circle cx={222} cy={146} r={38} fill={plate} />
    <circle cx={222} cy={146} r={29} fill="#E9D7AE" />
    <circle cx={214} cy={140} r={5} fill={colors.red} />
    <circle cx={229} cy={150} r={4} fill={colors.red} />
    {/* Cutlery */}
    <rect x={172} y={20} width={5} height={70} rx={2} fill="#B8BEC8" transform="rotate(20 174 55)" />
  </g>
);

export const BreakfastTray: React.FC<BreakfastTrayProps> = ({
  cols = 1,
  rows = 1,
  cellWidth = 300,
  gap = 22,
  heroScale = 2.4,
  appearAt = 0,
  multiplyAt = 60,
  stagger = 3,
  trayColor,
  plateColor,
  rimColor,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme(themable);
  const tray = trayColor ?? "#9A6A3E";
  const plate = plateColor ?? colors.cream;
  const rim = rimColor ?? "#3E6FB0";
  const cellH = cellWidth * 0.72;
  const W = cols * cellWidth + (cols - 1) * gap;
  const H = rows * cellH + (rows - 1) * gap;
  const heroC = Math.floor((cols - 1) / 2);
  const heroR = Math.floor((rows - 1) / 2);
  const s = cellWidth / 300;

  const trays: React.ReactNode[] = [];
  let heroNode: React.ReactNode = null;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const cx = c * (cellWidth + gap) + cellWidth / 2;
      const cy = r * (cellH + gap) + cellH / 2;
      const hero = r === heroR && c === heroC;
      let scale: number;
      let x = cx;
      let y = cy;
      let opacity = 1;
      let rot = 0;
      if (hero) {
        const inP = spring({ frame: frame - appearAt, fps, config: { damping: 13, mass: 0.6 } });
        const shrink = interpolate(frame, [multiplyAt, multiplyAt + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
        scale = inP * interpolate(shrink, [0, 1], [heroScale, 1]);
        x = interpolate(shrink, [0, 1], [W / 2, cx]);
        y = interpolate(shrink, [0, 1], [H / 2, cy]);
        opacity = frame < appearAt ? 0 : 1;
        rot = (1 - shrink) * Math.sin(frame / 30) * 2;
      } else {
        const ring = Math.max(Math.abs(c - heroC), Math.abs(r - heroR));
        const at = multiplyAt + 14 + (ring - 1) * stagger * 2 + ((r * 7 + c * 3) % 3);
        const p = spring({ frame: frame - at, fps, config: { damping: 12, mass: 0.5, stiffness: 190 } });
        scale = p;
        opacity = p > 0.01 ? 1 : 0;
      }
      if (opacity <= 0 || scale <= 0.001) continue;
      const node = (
        <g key={`${r}-${c}`} transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale * s}) translate(-146 -102)`}>
          <TrayArt tray={tray} plate={plate} rim={rim} colors={colors} />
        </g>
      );
      if (hero) heroNode = node;
      else trays.push(node);
    }
  // Draw the hero last so it sits on top while it's big.
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {trays}
      {heroNode}
    </svg>
  );
};
