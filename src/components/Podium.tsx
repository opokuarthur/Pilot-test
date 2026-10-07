// Podium: a generic press-conference set. Plain backdrop (abstract pattern,
// no sponsor logos), a podium with a blank front panel, a cluster of
// microphones with blank coloured mic flags, a coach silhouette speaking
// behind it, and press cameras in the foreground firing flashes (starburst +
// a brief brightness pop over the whole set).
import React from "react";
import { random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { coachLook } from "./Silhouettes";
import { PersonFigure } from "./Person";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type PodiumProps = ThemableProps & {
  /** Rendered width; height = width × 1.25. */
  width?: number;
  appearAt?: number;
  /** Camera flashes between these frames, about `flashRate` per second. */
  flashFrom?: number;
  flashTo?: number;
  flashRate?: number;
  /** Show the speaker silhouette. */
  speaker?: boolean;
  /** Speaker gestures (pose changes) while talking. */
  talking?: boolean;
};

/** Deterministic flash schedule. */
const flashes = (from: number, to: number, rate: number, fps: number) => {
  const list: { at: number; x: number; y: number }[] = [];
  let t = from;
  let k = 0;
  while (t < to) {
    list.push({ at: Math.round(t), x: 0.08 + random(`fx${k}`) * 0.84, y: 0.8 + random(`fy${k}`) * 0.14 });
    t += (fps / rate) * (0.4 + random(`ft${k}`) * 1.2);
    k++;
  }
  return list;
};

export const Podium: React.FC<PodiumProps> = ({
  width = 900,
  appearAt = 0,
  flashFrom = 0,
  flashTo = Infinity,
  flashRate = 3,
  speaker = true,
  talking = true,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  const W = width;
  const H = W * 1.25;
  const inP = spring({ frame: frame - appearAt, fps, config: { damping: 14, mass: 0.8 } });
  const fl = flashes(flashFrom, Math.min(flashTo, durationInFrames), flashRate, fps);
  const active = fl.filter((f) => frame >= f.at && frame < f.at + 7);
  const pop = active.reduce((m, f) => Math.max(m, 1 - (frame - f.at) / 7), 0);
  const wood = "#2A1D18";
  const podTop = H * 0.52;
  const cx = W / 2;
  const mouth = { x: cx, y: podTop - H * 0.2 };
  const flagColors = [colors.red, colors.gold, "#3E6FB0", colors.cream, "#2F7D5B", "#7A4E9C", colors.red];

  const sScale = (H * 0.5) / 430;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", opacity: inP }}>
      <defs>
        <pattern id="pressWall" width="120" height="120" patternUnits="userSpaceOnUse">
          <rect width="120" height="120" fill={shade(colors.navy, 0.1)} />
          <path d="M60 18 L102 60 L60 102 L18 60 Z" fill="none" stroke={alpha(colors.cream, 0.06)} strokeWidth={4} />
          <circle cx={60} cy={60} r={8} fill={alpha(colors.gold, 0.08)} />
        </pattern>
        <radialGradient id="podSpot" cx="0.5" cy="0.35" r="0.6">
          <stop offset="0" stopColor={alpha(colors.cream, 0.22)} />
          <stop offset="1" stopColor={alpha(colors.cream, 0)} />
        </radialGradient>
      </defs>
      {/* Backdrop + spot */}
      <rect x={-400} y={-400} width={W + 800} height={H * 0.78 + 400} fill="url(#pressWall)" />
      <rect x={-80} y={0} width={W + 160} height={H * 0.78} fill="url(#podSpot)" />
      <rect x={-400} y={H * 0.78} width={W + 800} height={H * 0.6} fill={shade(colors.navy, 0.4)} />
      {/* Speaker (coach silhouette) behind the podium */}
      {speaker ? (
        <g transform={`translate(${cx - 100 * sScale} ${podTop + H * 0.1 - 400 * sScale}) scale(${sScale})`}>
          <PersonFigure
            {...coachLook(colors)}
            pose={talking ? [{ at: 0, value: "idle" }, { at: 40, value: "shrug" }, { at: 70, value: "idle" }, { at: 130, value: "reach" }, { at: 160, value: "idle" }, { at: 230, value: "shrug" }, { at: 260, value: "idle" }] : "idle"}
          />
        </g>
      ) : null}
      {/* Microphone cluster: stands converge on the speaker's mouth */}
      {Array.from({ length: 7 }, (_, k) => {
        const bx = cx + (k - 3) * W * 0.06;
        const by = podTop + 4;
        const tip = { x: mouth.x + (k - 3) * W * 0.022, y: mouth.y + Math.abs(k - 3) * 6 + 30 };
        const ang = (Math.atan2(tip.y - by, tip.x - bx) * 180) / Math.PI;
        return (
          <g key={k}>
            <line x1={bx} y1={by} x2={tip.x} y2={tip.y} stroke={shade(colors.grey, 0.4)} strokeWidth={6} strokeLinecap="round" />
            <g transform={`translate(${tip.x} ${tip.y}) rotate(${ang + 180})`}>
              <rect x={-4} y={-15} width={46} height={30} rx={6} fill={flagColors[k]} />
              <rect x={-4} y={-15} width={46} height={8} rx={4} fill="#fff" opacity={0.18} />
              <ellipse cx={-6} cy={0} rx={16} ry={14} fill={shade(colors.grey, 0.55)} />
              <ellipse cx={-8} cy={-4} rx={6} ry={5} fill={tint(colors.grey, 0.3)} opacity={0.6} />
            </g>
          </g>
        );
      })}
      {/* Podium (blank front panel, gold trim) */}
      <path d={`M${cx - W * 0.26} ${podTop} H${cx + W * 0.26} L${cx + W * 0.21} ${H * 0.86} H${cx - W * 0.21} Z`} fill={wood} />
      <rect x={cx - W * 0.28} y={podTop - 10} width={W * 0.56} height={26} rx={6} fill={shade(wood, 0.3)} />
      <path d={`M${cx - W * 0.17} ${podTop + H * 0.06} H${cx + W * 0.17} L${cx + W * 0.15} ${H * 0.78} H${cx - W * 0.15} Z`} fill={shade(colors.navy, 0.15)} stroke={colors.gold} strokeWidth={4} />
      <path d={`M${cx - W * 0.26} ${podTop} H${cx - W * 0.2} L${cx - W * 0.17} ${H * 0.86} H${cx - W * 0.21} Z`} fill="#fff" opacity={0.06} />
      {/* Press cameras in the foreground (silhouettes) */}
      {Array.from({ length: 5 }, (_, k) => {
        const x = W * (0.1 + k * 0.2);
        const y = H * (0.9 + (k % 2) * 0.03);
        return (
          <g key={k} transform={`translate(${x} ${y}) rotate(${(k - 2) * 4})`}>
            <rect x={-34} y={-40} width={8} height={160} fill="#05070D" />
            <rect x={-70} y={-70} width={140} height={84} rx={14} fill="#05070D" />
            <rect x={-30} y={-96} width={60} height={30} rx={6} fill="#05070D" />
            <circle cx={0} cy={-28} r={30} fill="#0F1422" stroke="#05070D" strokeWidth={8} />
            <circle cx={-10} cy={-36} r={8} fill={alpha(colors.cream, 0.15)} />
          </g>
        );
      })}
      {/* Flashes */}
      {active.map((f, i) => {
        const p = 1 - (frame - f.at) / 7;
        const x = f.x * W;
        const y = f.y * H - 120;
        return (
          <g key={i} opacity={p}>
            <circle cx={x} cy={y} r={180 * (1.2 - p * 0.4)} fill={alpha("#FFFFFF", 0.25)} />
            <path transform={`translate(${x} ${y}) scale(${1.4 + (1 - p)})`} d="M0 -60 L10 -10 L60 0 L10 10 L0 60 L-10 10 L-60 0 L-10 -10 Z" fill="#FFFFFF" />
            <circle cx={x} cy={y} r={20} fill="#FFFFFF" />
          </g>
        );
      })}
      {/* Whole-set brightness pop */}
      {pop > 0 ? <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="#FFFFFF" opacity={pop * 0.16} /> : null}
      {/* "LIVE" bug (generic) */}
      <g transform={`translate(${W * 0.06} ${H * 0.05})`}>
        <rect width={150} height={54} rx={10} fill={colors.red} />
        <circle cx={30} cy={27} r={10} fill={colors.cream} opacity={0.5 + 0.5 * Math.sin(frame / 5)} />
        <text x={92} y={40} textAnchor="middle" fontFamily={fonts.headline} fontSize={38} fill={colors.cream} letterSpacing={2}>
          LIVE
        </text>
      </g>
    </svg>
  );
};
