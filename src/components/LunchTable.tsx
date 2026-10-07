// LunchTable: a long team table seen from the side. Seated silhouettes eat
// (fork hand goes plate → mouth on their own rhythm). One seat is the #7
// player (red rim + number). A standing coach silhouette behind him reaches
// over and taps his shoulder at `tapAt`; a speech bubble pops at `bubbleAt`
// ("30 minutes?") and an optional reply bubble at `replyAt`. All figures
// are solid silhouettes (no faces).
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type LunchTableProps = ThemableProps & {
  width?: number;
  seats?: number;
  /** Index of the #7 seat (0 = leftmost). */
  playerSeat?: number;
  appearAt?: number;
  tapAt?: number;
  bubbleText?: string;
  bubbleAt?: number;
  replyText?: string;
  replyAt?: number;
  /** Everyone stops eating and looks (a beat of tension). */
  freezeAt?: number;
};

const Bubble: React.FC<{ x: number; y: number; text: string; at: number; tail: "left" | "right"; fill: string; ink: string; font: string; size: number }> = ({
  x,
  y,
  text,
  at,
  tail,
  fill,
  ink,
  font,
  size,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const p = spring({ frame: frame - at, fps, config: { damping: 9, mass: 0.5, stiffness: 190 } });
  const w = size * (0.6 * Array.from(text).length + 1.6);
  const h = size * 1.9;
  const bob = Math.sin((frame - at) / 16) * 4;
  const tx = tail === "left" ? x - w * 0.3 : x + w * 0.3 - w;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${p}) translate(${-x} ${-y})`}>
      <rect x={tx + 8} y={y - h - 34 + 8} width={w} height={h} rx={h / 2} fill="#000" opacity={0.3} />
      <rect x={tx} y={y - h - 34} width={w} height={h} rx={h / 2} fill={fill} />
      <path d={tail === "left" ? `M${x - 10} ${y - 40} L${x - 4} ${y} L${x + 30} ${y - 40} Z` : `M${x + 10} ${y - 40} L${x + 4} ${y} L${x - 30} ${y - 40} Z`} fill={fill} />
      <text x={tx + w / 2} y={y - 34 - h / 2 + size * 0.36} textAnchor="middle" fontFamily={font} fontWeight={800} fontSize={size} fill={ink}>
        {text}
      </text>
    </g>
  );
};

export const LunchTable: React.FC<LunchTableProps> = ({
  width = 1000,
  seats = 5,
  playerSeat = 2,
  appearAt = 0,
  tapAt,
  bubbleText = "30 minutes?",
  bubbleAt,
  replyText,
  replyAt,
  freezeAt,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  const W = width;
  const H = width * 0.95;
  const T = H * 0.62; // table top
  const sil = colors.ink;
  const inP = spring({ frame: frame - appearAt, fps, config: { damping: 14, mass: 0.8 } });
  const spacing = W / seats;
  const seatX = (i: number) => spacing * (i + 0.5);
  const px = seatX(playerSeat);
  const coachX = px + spacing * 0.62;
  const frozen = freezeAt !== undefined && frame >= freezeAt;

  // Coach arm: hangs, then reaches to the player's near shoulder and taps twice.
  const ta = tapAt ?? 1e9;
  const reach = interpolate(frame, [ta - 12, ta], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const tap = frame >= ta && frame < ta + 20 ? Math.abs(Math.sin(((frame - ta) / 10) * Math.PI)) * 10 : 0;
  const cShoulder = { x: coachX - 46, y: T - 268 };
  const target = { x: px + 50, y: T - 160 + tap };
  const rest = { x: coachX - 60, y: T - 100 };
  const hand = { x: rest.x + (target.x - rest.x) * reach, y: rest.y + (target.y - rest.y) * reach };
  const elbow = { x: (cShoulder.x + hand.x) / 2 + 10, y: Math.max(cShoulder.y, hand.y) + 34 };
  // The player turns a little toward the coach after the tap.
  const turn = interpolate(frame, [ta + 4, ta + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const seated = (i: number) => {
    const x = seatX(i);
    const isPlayer = i === playerSeat;
    const ph = (frame + i * 23) / (36 + i * 4);
    const eat = frozen ? 0 : Math.max(0, Math.sin(ph * Math.PI * 2)) ** 2;
    const hand2 = { x: x + 34 - eat * 30, y: T - 6 - eat * 150 };
    const sh = { x: x + 46, y: T - 150 };
    const el = { x: x + 72, y: (sh.y + hand2.y) / 2 + 30 };
    const lean = isPlayer ? turn * 6 : 0;
    const bob = Math.sin((frame + i * 11) / 22) * 2;
    return (
      <g key={i} transform={`translate(0 ${bob}) rotate(${lean} ${x} ${T})`} style={{ filter: `drop-shadow(0 0 5px ${isPlayer ? alpha(colors.red, 0.9) : alpha(colors.cream, 0.25)})` }}>
        {/* Chair back */}
        <rect x={x - 70} y={T - 200} width={140} height={200} rx={20} fill={shade(colors.navy, 0.35)} />
        {/* Torso + head */}
        <path d={`M${x - 60} ${T} L${x - 56} ${T - 140} Q${x - 52} ${T - 162} ${x - 30} ${T - 166} L${x + 30} ${T - 166} Q${x + 52} ${T - 162} ${x + 56} ${T - 140} L${x + 60} ${T} Z`} fill={sil} />
        <rect x={x - 13} y={T - 196} width={26} height={36} rx={9} fill={sil} />
        <circle cx={x} cy={T - 222} r={36} fill={sil} />
        {isPlayer ? (
          <text x={x} y={T - 50} textAnchor="middle" fontFamily={fonts.headline} fontSize={70} fill={colors.red} stroke={colors.cream} strokeWidth={3} paintOrder="stroke fill">
            7
          </text>
        ) : null}
        {/* Eating arm */}
        <path d={`M${sh.x} ${sh.y} L${el.x} ${el.y} L${hand2.x} ${hand2.y}`} stroke={sil} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <line x1={hand2.x} y1={hand2.y} x2={hand2.x - 18} y2={hand2.y - 30} stroke={tint(colors.grey, 0.4)} strokeWidth={5} strokeLinecap="round" />
      </g>
    );
  };

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", opacity: Math.min(1, inP * 1.5), transform: `translateY(${(1 - inP) * 120}px)` }}>
      {/* Window light on the back wall */}
      {[0.15, 0.5, 0.85].map((f) => (
        <rect key={f} x={W * f - 110} y={T - 520} width={220} height={260} rx={14} fill={alpha(colors.gold, 0.1)} stroke={alpha(colors.gold, 0.18)} strokeWidth={4} />
      ))}
      {/* Standing coach (behind the table) */}
      <g style={{ filter: `drop-shadow(0 0 6px ${alpha(colors.cream, 0.6)})` }}>
        <path d={`M${coachX - 72} ${T} L${coachX - 68} ${T - 250} Q${coachX - 62} ${T - 280} ${coachX - 34} ${T - 286} L${coachX + 34} ${T - 286} Q${coachX + 62} ${T - 280} ${coachX + 68} ${T - 250} L${coachX + 72} ${T} Z`} fill="#060A15" />
        <path d={`M${coachX - 20} ${T - 284} L${coachX} ${T - 236} L${coachX + 20} ${T - 284} Z`} fill={alpha(colors.cream, 0.9)} />
        <path d={`M${coachX} ${T - 276} L${coachX + 6} ${T - 266} L${coachX + 3} ${T - 238} L${coachX} ${T - 232} L${coachX - 3} ${T - 238} L${coachX - 6} ${T - 266} Z`} fill={colors.ink} />
        <rect x={coachX - 14} y={T - 318} width={28} height={38} rx={10} fill="#060A15" />
        <circle cx={coachX} cy={T - 346} r={40} fill="#060A15" />
        <path d={`M${cShoulder.x} ${cShoulder.y} L${elbow.x} ${elbow.y} L${hand.x} ${hand.y}`} stroke="#060A15" strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      {Array.from({ length: seats }, (_, i) => seated(i))}
      {/* Table top + cloth */}
      <rect x={-20} y={T - 8} width={W + 40} height={34} rx={8} fill={tint(colors.cream, 0.1)} />
      <rect x={-20} y={T + 22} width={W + 40} height={H - T - 22} fill={colors.cream} />
      <rect x={-20} y={T + 22} width={W + 40} height={18} fill={shade(colors.cream, 0.15)} />
      {Array.from({ length: 9 }, (_, k) => (
        <path key={k} d={`M${(k + 0.5) * (W / 9)} ${T + 40} q 10 ${H * 0.18} -4 ${H - T}`} stroke={shade(colors.cream, 0.1)} strokeWidth={4} fill="none" />
      ))}
      {/* Plates + glasses */}
      {Array.from({ length: seats }, (_, i) => (
        <g key={i}>
          <ellipse cx={seatX(i) + 6} cy={T + 2} rx={58} ry={12} fill={tint(colors.grey, 0.6)} />
          <ellipse cx={seatX(i) + 6} cy={T - 2} rx={30} ry={7} fill={i % 2 ? colors.gold : "#C8553D"} />
          <rect x={seatX(i) - 62} y={T - 52} width={22} height={50} rx={5} fill={alpha("#9CC9F0", 0.5)} stroke={alpha(colors.cream, 0.7)} strokeWidth={2} />
        </g>
      ))}
      <Bubble x={coachX + 10} y={T - 396} text={bubbleText} at={bubbleAt ?? Infinity} tail="right" fill={colors.cream} ink={colors.ink} font={fonts.body} size={50} />
      {replyText ? <Bubble x={px - 40} y={T - 258} text={replyText} at={replyAt ?? Infinity} tail="right" fill={colors.gold} ink={colors.navy} font={fonts.body} size={50} /> : null}
    </svg>
  );
};
