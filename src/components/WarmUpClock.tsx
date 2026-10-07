// WarmUpClock: a match clock that spins through the minutes (45' → 90' by
// default). A ring fills toward 90, the readout pulses on every minute, and
// the sweep hand speeds up with the clock, so tension rises. From `redFrom`
// the clock turns red and throbs; at `whistleAt` a whistle bursts in with a
// shake and a "FULL TIME" plate.
//   minutes={[{ at: 0, value: 45 }, { at: 70, value: 50 }, { at: 180, value: 90 }]}
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, mix, shade } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type WarmUpClockProps = ThemableProps & {
  size?: number;
  /** Clock minute over time (linear between keys). */
  minutes?: { at: number; value: number }[];
  /** Minute the full ring represents. */
  fullTime?: number;
  appearAt?: number;
  exitAt?: number;
  /** Minute from which the clock goes red. */
  redFrom?: number;
  whistleAt?: number;
  label?: string;
};

const Whistle: React.FC<{ size: number; color: string; ink: string }> = ({ size, color, ink }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 140 100" style={{ overflow: "visible" }}>
    <path d="M10 30 H80 Q90 30 96 40 A36 36 0 1 1 52 70 L52 56 H18 Q10 56 10 48 Z" fill={color} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={92} cy={62} r={14} fill={ink} />
    <rect x={2} y={34} width={16} height={18} rx={4} fill={ink} />
  </svg>
);

export const WarmUpClock: React.FC<WarmUpClockProps> = ({
  size = 520,
  minutes = [
    { at: 0, value: 45 },
    { at: 120, value: 90 },
  ],
  fullTime = 90,
  appearAt = 0,
  exitAt,
  redFrom = 86,
  whistleAt,
  label = "MATCH CLOCK",
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  if (frame < appearAt) return null;
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  if (out >= 1) return null;
  const inP = spring({ frame: frame - appearAt, fps, config: { damping: 11, mass: 0.6, stiffness: 150 } });

  const ats = minutes.map((m) => m.at);
  const vals = minutes.map((m) => m.value);
  const minute = interpolate(frame, ats, vals, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shown = Math.floor(minute + 1e-6);
  // Minutes per frame right now → sweep speed and pulse rate.
  const rate = Math.max(0, interpolate(frame + 1, ats, vals, { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) - minute);
  // Sweep angle = integral of the rate: one turn per clock minute.
  const sweep = (minute - vals[0]) * 360;
  const sinceTick = (minute - shown) / Math.max(rate, 1e-3); // frames since the last minute change
  const tick = rate > 0 ? Math.max(0, 1 - sinceTick / 6) : 0;
  const red = interpolate(minute, [redFrom - 4, redFrom], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const throb = minute >= redFrom ? 0.5 + 0.5 * Math.sin(frame / 3) : 0;
  const ringColor = mix(colors.gold, colors.red, red);
  const wa = whistleAt ?? 1e9;
  const whistleP = frame < wa ? 0 : spring({ frame: frame - wa, fps, config: { damping: 8, mass: 0.5, stiffness: 180 } });
  const shake = frame >= wa && frame < wa + 14 ? Math.sin((frame - wa) * 2.3) * 14 * (1 - (frame - wa) / 14) : 0;

  const R = size / 2;
  const r = R * 0.84;
  const C = 2 * Math.PI * r;
  const frac = Math.min(1, minute / fullTime);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        transform: `translateX(${shake}px) scale(${inP * (1 - out * 0.4) * (1 + tick * 0.025)})`,
        opacity: 1 - out,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
        {/* Red throb glow */}
        <circle cx={R} cy={R} r={R * (1.02 + throb * 0.06)} fill={alpha(colors.red, 0.18 * red + 0.15 * throb)} />
        <circle cx={R} cy={R} r={R * 0.98} fill={colors.ink} />
        <circle cx={R} cy={R} r={R * 0.92} fill={shade(colors.navy, 0.1)} stroke={alpha(colors.cream, 0.12)} strokeWidth={4} />
        {/* Minute ticks (every 5') */}
        {Array.from({ length: 18 }, (_, k) => {
          const a = (k / 18) * Math.PI * 2 - Math.PI / 2;
          const big = k % 9 === 0;
          const r1 = r - (big ? 42 : 26);
          const passed = (k * 5) / fullTime <= frac;
          return (
            <line
              key={k}
              x1={R + Math.cos(a) * r1}
              y1={R + Math.sin(a) * r1}
              x2={R + Math.cos(a) * (r - 12)}
              y2={R + Math.sin(a) * (r - 12)}
              stroke={passed ? ringColor : alpha(colors.cream, 0.3)}
              strokeWidth={big ? 9 : 5}
              strokeLinecap="round"
            />
          );
        })}
        {/* Progress ring toward full time */}
        <circle cx={R} cy={R} r={r} fill="none" stroke={alpha(colors.cream, 0.1)} strokeWidth={18} />
        <circle
          cx={R}
          cy={R}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={18}
          strokeLinecap="round"
          strokeDasharray={`${C * frac} ${C}`}
          transform={`rotate(-90 ${R} ${R})`}
        />
        {/* Sweep hand: one turn per clock minute, so it speeds up with the clock */}
        <g transform={`rotate(${sweep} ${R} ${R})`}>
          <line x1={R} y1={R} x2={R} y2={R - r * 0.78} stroke={alpha(ringColor, 0.85)} strokeWidth={6} strokeLinecap="round" />
          {rate > 0.04 ? <path d={`M${R} ${R} L${R - r * 0.3} ${R - r * 0.72} A ${r * 0.78} ${r * 0.78} 0 0 1 ${R} ${R - r * 0.78} Z`} fill={alpha(ringColor, Math.min(0.35, rate * 1.5))} /> : null}
        </g>
        <circle cx={R} cy={R} r={14} fill={ringColor} />
        {/* H/T and F/T markers */}
        <text x={R} y={R + r + 4 - 60} textAnchor="middle" fontFamily={fonts.body} fontWeight={800} fontSize={size * 0.05} fill={alpha(colors.cream, 0.55)} letterSpacing={3}>
          HT
        </text>
        <text x={R} y={R - r + 72} textAnchor="middle" fontFamily={fonts.body} fontWeight={800} fontSize={size * 0.05} fill={alpha(colors.cream, 0.55)} letterSpacing={3}>
          FT
        </text>
      </svg>
      {/* Readout */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${1 + tick * 0.08})`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.headline,
            fontSize: size * 0.33,
            lineHeight: 1,
            color: mix(colors.cream, colors.red, red),
            textShadow: `${size * 0.012}px ${size * 0.012}px 0 #000`,
            fontVariantNumeric: "tabular-nums",
            background: alpha(colors.ink, 0.6),
            padding: `0 ${size * 0.03}px`,
            borderRadius: size * 0.03,
          }}
        >
          {shown}&apos;
        </div>
        <div style={{ fontFamily: fonts.body, fontWeight: 800, fontSize: size * 0.045, letterSpacing: 5, color: alpha(colors.cream, 0.6), marginTop: size * 0.02 }}>{label}</div>
      </div>
      {/* Whistle + FULL TIME */}
      {whistleP > 0 ? (
        <>
          <div style={{ position: "absolute", left: size * 0.62, top: -size * 0.1, transform: `scale(${whistleP}) rotate(${-14 + Math.sin(frame / 2) * 6}deg)` }}>
            <svg width={size * 0.6} height={size * 0.4} viewBox="0 0 150 100" style={{ position: "absolute", left: -size * 0.12, top: -size * 0.1, overflow: "visible" }}>
              {[0, 1, 2].map((k) => (
                <path key={k} d={`M${120 + k * 14} ${20 - k * 10} q 16 30 0 60`} stroke={colors.cream} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(frame / 2 + k)} />
              ))}
            </svg>
            <Whistle size={size * 0.34} color={colors.cream} ink={colors.ink} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: -size * 0.08,
              display: "flex",
              justifyContent: "center",
              transform: `scale(${whistleP}) rotate(-3deg)`,
            }}
          >
            <div style={{ fontFamily: fonts.headline, fontSize: size * 0.12, color: colors.cream, background: colors.red, padding: `${size * 0.01}px ${size * 0.04}px 0`, borderRadius: size * 0.015, boxShadow: `6px 6px 0 ${colors.ink}`, letterSpacing: 2 }}>
              FULL TIME
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
