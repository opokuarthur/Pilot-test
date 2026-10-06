// TalkShowSet: a simple generic studio — back wall with an abstract screen,
// lighting truss whose spotlights switch on one by one (with a flicker),
// a round stage, two armchairs angled toward each other, a coffee table and
// an ON AIR sign. Optional seated guests are SOLID SILHOUETTES only (no
// faces); `talking` adds pulsing sound arcs next to one of them.
import React from "react";
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type TalkShowSetProps = ThemableProps & {
  /** Rendered width in px (height = width × 0.9). */
  width?: number;
  /** Frame the set rises in. */
  appearAt?: number;
  /** Frame the first spotlight switches on (the rest follow). */
  lightsOnAt?: number;
  lightStagger?: number;
  chairColor?: string;
  /** Draw solid seated silhouettes in the chairs. */
  guests?: boolean;
  silhouetteColor?: string;
  /** Which seat is talking (sound arcs), with frame ranges. */
  talking?: { side: "left" | "right"; from: number; to: number }[];
};

const Chair: React.FC<{ x: number; facing: 1 | -1; color: string }> = ({ x, facing, color }) => (
  <g transform={`translate(${x} 0) scale(${facing} 1)`}>
    {/* Legs */}
    <rect x={-70} y={720} width={12} height={48} rx={4} fill={shade(color, 0.55)} />
    <rect x={56} y={720} width={12} height={48} rx={4} fill={shade(color, 0.55)} />
    {/* Back */}
    <path d="M-92 560 Q-100 470 -40 462 L30 470 Q60 476 56 520 L50 640 L-80 650 Z" fill={shade(color, 0.18)} />
    {/* Seat */}
    <rect x={-90} y={640} width={180} height={64} rx={26} fill={color} />
    <rect x={-90} y={690} width={180} height={34} rx={14} fill={shade(color, 0.3)} />
    {/* Arm (near side) */}
    <rect x={56} y={600} width={46} height={110} rx={22} fill={tint(color, 0.08)} />
  </g>
);

/** Seated person as a flat silhouette (no features at all). */
const SeatedSilhouette: React.FC<{ x: number; facing: 1 | -1; color: string; rim: string; t: number }> = ({ x, facing, color, rim, t }) => {
  const bob = Math.sin(t / 22) * 2;
  return (
    <g transform={`translate(${x} ${bob}) scale(${facing} 1)`} style={{ filter: `drop-shadow(0 0 6px ${rim})` }}>
      {/* Legs: thigh forward, shin down */}
      <path d="M-30 640 L70 640 Q92 642 92 664 L92 760 L66 760 L66 676 L-30 676 Z" fill={color} />
      <ellipse cx={86} cy={762} rx={26} ry={10} fill={color} />
      {/* Torso leaning back slightly */}
      <path d="M-58 520 Q-60 470 -10 466 Q40 466 44 520 L40 650 L-62 650 Z" fill={color} />
      {/* Arm on armrest */}
      <path d="M20 500 Q56 560 72 610 L100 612" stroke={color} strokeWidth={30} strokeLinecap="round" fill="none" />
      {/* Neck + head */}
      <rect x={-20} y={430} width={30} height={46} rx={10} fill={color} />
      <circle cx={-4} cy={408} r={44} fill={color} />
    </g>
  );
};

export const TalkShowSet: React.FC<TalkShowSetProps> = ({
  width = 1000,
  appearAt = 0,
  lightsOnAt = 10,
  lightStagger = 6,
  chairColor,
  guests = true,
  silhouetteColor,
  talking = [],
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  if (frame < appearAt) return null;
  const rise = spring({ frame: frame - appearAt, fps, config: { damping: 16, mass: 0.8 } });
  const chair = chairColor ?? colors.red;
  const sil = silhouetteColor ?? colors.ink;
  const lamps = [170, 390, 610, 830];
  const lampOn = (i: number) => {
    const on = lightsOnAt + i * lightStagger;
    if (frame < on) return 0;
    // Flicker for a few frames, then steady.
    const f = frame - on;
    if (f < 6) return random(`flk${i}${f}`) > 0.45 ? 1 : 0.2;
    return 1;
  };
  const allOn = interpolate(frame, [lightsOnAt + lamps.length * lightStagger, lightsOnAt + lamps.length * lightStagger + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const onAirBlink = allOn > 0 ? 0.75 + 0.25 * Math.sin(frame / 6) : 0.15;

  return (
    <svg width={width} height={width * 0.9} viewBox="0 0 1000 900" style={{ overflow: "visible", transform: `translateY(${(1 - rise) * 200}px)`, opacity: Math.min(1, rise * 1.5) }}>
      <defs>
        <linearGradient id={`wall${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(colors.navy, 0.35)} />
          <stop offset="1" stopColor={tint(colors.navy, 0.08)} />
        </linearGradient>
        <linearGradient id={`cone${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint(colors.gold, 0.5)} stopOpacity={0.55} />
          <stop offset="1" stopColor={colors.gold} stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`stage${uid}`} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor={tint(colors.navy, 0.3 + 0.12 * allOn)} />
          <stop offset="1" stopColor={shade(colors.navy, 0.2)} />
        </radialGradient>
      </defs>
      {/* Back wall with panels */}
      <rect x={0} y={60} width={1000} height={640} rx={20} fill={`url(#wall${uid})`} />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={20 + i * 108} y={80} width={96} height={600} rx={8} fill={alpha(colors.cream, 0.03 + (i % 2) * 0.02)} />
      ))}
      {/* Abstract screen: concentric gold arcs */}
      <g opacity={0.35 + 0.5 * allOn}>
        <rect x={290} y={150} width={420} height={250} rx={18} fill={shade(colors.navy, 0.45)} stroke={alpha(colors.gold, 0.6)} strokeWidth={4} />
        {[0, 1, 2, 3].map((k) => (
          <circle key={k} cx={500} cy={275} r={30 + k * 34 + ((frame * 0.8) % 34)} fill="none" stroke={colors.gold} strokeOpacity={0.5 - k * 0.1} strokeWidth={5} />
        ))}
      </g>
      {/* Truss + lamps */}
      <rect x={40} y={40} width={920} height={20} rx={6} fill={shade(colors.grey, 0.4)} />
      {Array.from({ length: 23 }, (_, i) => (
        <path key={i} d={`M${40 + i * 40} 40 L${60 + i * 40} 60`} stroke={shade(colors.grey, 0.15)} strokeWidth={3} />
      ))}
      {lamps.map((lx, i) => {
        const on = lampOn(i);
        const aim = lx < 500 ? 1 : -1;
        return (
          <g key={lx}>
            {on > 0 ? (
              <path d={`M${lx - 22} 92 L${lx + 22} 92 L${lx + aim * 120 + 170} 820 L${lx + aim * 120 - 170} 820 Z`} fill={`url(#cone${uid})`} opacity={on * 0.85} style={{ mixBlendMode: "screen" }} />
            ) : null}
            <g transform={`rotate(${-aim * 12} ${lx} 64)`}>
              <rect x={lx - 6} y={58} width={12} height={20} fill={shade(colors.grey, 0.4)} />
              <path d={`M${lx - 28} 74 L${lx + 28} 74 L${lx + 22} 104 L${lx - 22} 104 Z`} fill={shade(colors.grey, 0.5)} />
              <ellipse cx={lx} cy={104} rx={22} ry={6} fill={on > 0.5 ? tint(colors.gold, 0.6) : shade(colors.grey, 0.2)} />
            </g>
          </g>
        );
      })}
      {/* ON AIR */}
      <g transform="translate(830 130)">
        <rect x={-70} y={-26} width={140} height={52} rx={10} fill={shade(colors.red, 0.5)} />
        <rect x={-64} y={-20} width={128} height={40} rx={7} fill={colors.red} opacity={onAirBlink} />
        <text y={13} textAnchor="middle" fontFamily={fonts.headline} fontSize={34} fill={colors.cream} letterSpacing={3} opacity={0.5 + 0.5 * onAirBlink}>
          ON AIR
        </text>
      </g>
      {/* Stage */}
      <ellipse cx={500} cy={770} rx={480} ry={110} fill={shade(colors.navy, 0.5)} />
      <ellipse cx={500} cy={755} rx={470} ry={100} fill={`url(#stage${uid})`} />
      <ellipse cx={500} cy={755} rx={470} ry={100} fill="none" stroke={alpha(colors.gold, 0.4 + 0.4 * allOn)} strokeWidth={5} />
      {/* Chairs + guests */}
      <Chair x={260} facing={1} color={chair} />
      <Chair x={740} facing={-1} color={chair} />
      {guests ? (
        <>
          <SeatedSilhouette x={250} facing={1} color={sil} rim={alpha(colors.gold, 0.7)} t={frame} />
          <SeatedSilhouette x={750} facing={-1} color={sil} rim={alpha(colors.gold, 0.7)} t={frame + 40} />
        </>
      ) : null}
      {/* Coffee table with two mugs */}
      <ellipse cx={500} cy={690} rx={80} ry={18} fill={tint(colors.navy, 0.35)} />
      <rect x={492} y={690} width={16} height={70} fill={shade(colors.navy, 0.3)} />
      <ellipse cx={500} cy={762} rx={50} ry={10} fill={shade(colors.navy, 0.3)} />
      <rect x={462} y={664} width={22} height={26} rx={4} fill={colors.cream} />
      <rect x={516} y={664} width={22} height={26} rx={4} fill={colors.gold} />
      {/* Sound arcs for whoever is talking */}
      {talking.map((tk, k) => {
        if (frame < tk.from || frame > tk.to) return null;
        const x = tk.side === "left" ? 330 : 670;
        const d = tk.side === "left" ? 1 : -1;
        const fadeIn = interpolate(frame, [tk.from, tk.from + 6, tk.to - 6, tk.to], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
        return (
          <g key={k} opacity={fadeIn} stroke={colors.gold} strokeWidth={8} fill="none" strokeLinecap="round">
            {[0, 1, 2].map((a) => {
              const r = 30 + a * 26 + ((frame * 1.6) % 26);
              return <path key={a} d={`M${x + d * r * 0.7} ${400 - r * 0.7} A${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${x + d * r * 0.7} ${400 + r * 0.7}`} opacity={1 - a * 0.3} />;
            })}
          </g>
        );
      })}
    </svg>
  );
};
