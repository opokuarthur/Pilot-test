// TradingChart: a fake candlestick chart. Candles appear one by one on a
// rising trend, the newest candle "ticks" live, then at `freezeAt` everything
// stops: a dashed flat-line appears and the chart desaturates to grey.
import React, { useMemo } from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import { failFilter } from "../lib/motion";
import { alpha } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type TradingChartProps = ThemableProps & {
  width?: number;
  height?: number;
  candles?: number;
  /** Frame the first candle appears and how long until all are shown. */
  revealAt?: number;
  revealFrames?: number;
  /** Frame everything freezes and starts going grey. */
  freezeAt?: number;
  /** Frames the desaturation takes. */
  failFrames?: number;
  /** Pair label shown top-left (keep it generic). */
  label?: string;
  upColor?: string;
  downColor?: string;
  seed?: string;
  style?: React.CSSProperties;
};

type Candle = { o: number; c: number; h: number; l: number };

const makeCandles = (n: number, seed: string): Candle[] => {
  const out: Candle[] = [];
  let price = 100;
  for (let i = 0; i < n; i++) {
    const up = random(`${seed}d${i}`) > 0.22;
    const size = 3 + random(`${seed}s${i}`) * 9 + i * 0.35;
    const o = price;
    const c = up ? o + size : o - size * 0.6;
    const h = Math.max(o, c) + random(`${seed}h${i}`) * 5;
    const l = Math.min(o, c) - random(`${seed}l${i}`) * 5;
    out.push({ o, c, h, l });
    price = c;
  }
  return out;
};

export const TradingChart: React.FC<TradingChartProps> = ({
  width = 860,
  height = 520,
  candles = 26,
  revealAt = 0,
  revealFrames = 240,
  freezeAt,
  failFrames = 30,
  label = "COIN / GHS",
  upColor,
  downColor,
  seed = "chart",
  style,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { colors, fonts } = useTheme(themable);
  const up = upColor ?? colors.up;
  const down = downColor ?? colors.red;
  const data = useMemo(() => makeCandles(candles, seed), [candles, seed]);

  const frozen = freezeAt !== undefined && frame >= freezeAt;
  const f = frozen ? freezeAt! : frame;
  const shown = Math.floor(interpolate(f, [revealAt, revealAt + revealFrames], [2, candles], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const fail = freezeAt === undefined ? 0 : interpolate(frame, [freezeAt, freezeAt + failFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const pad = { l: 28, r: 120, t: 90, b: 40 };
  const min = Math.min(...data.map((d) => d.l)) - 5;
  const max = Math.max(...data.map((d) => d.h)) + 5;
  const cw = (width - pad.l - pad.r) / candles;
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (height - pad.t - pad.b);

  // Live wiggle on the newest candle until frozen.
  const live = frozen ? 0 : Math.sin(frame / 3) * 2.2 + Math.sin(frame / 7) * 1.5;
  const visible = data.slice(0, shown).map((d, i) => (i === shown - 1 ? { ...d, c: d.c + live, h: Math.max(d.h, d.c + live) } : d));
  const last = visible[visible.length - 1];
  const pct = ((last.c - data[0].o) / data[0].o) * 100;

  // Moving-average line under the candles.
  const ma = visible
    .map((_, i) => {
      const w = visible.slice(Math.max(0, i - 3), i + 1);
      const v = w.reduce((a, d) => a + (d.o + d.c) / 2, 0) / w.length;
      return `${i === 0 ? "M" : "L"}${(pad.l + i * cw + cw / 2).toFixed(1)},${y(v).toFixed(1)}`;
    })
    .join(" ");

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 28,
        background: alpha(colors.ink, 0.72),
        border: `2px solid ${alpha(colors.cream, 0.12)}`,
        position: "relative",
        overflow: "hidden",
        filter: failFilter(fail),
        ...style,
      }}
    >
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={pad.l} x2={width - pad.r + 10} y1={pad.t + g * (height - pad.t - pad.b)} y2={pad.t + g * (height - pad.t - pad.b)} stroke={alpha(colors.cream, 0.08)} strokeWidth={2} />
        ))}
        <path d={ma} stroke={alpha(colors.gold, 0.7)} strokeWidth={4} fill="none" strokeLinejoin="round" />
        {visible.map((d, i) => {
          const x = pad.l + i * cw + cw / 2;
          const col = d.c >= d.o ? up : down;
          const top = y(Math.max(d.o, d.c));
          const bodyH = Math.max(4, Math.abs(y(d.o) - y(d.c)));
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth={3} />
              <rect x={x - cw * 0.32} y={top} width={cw * 0.64} height={bodyH} rx={3} fill={col} />
            </g>
          );
        })}
        {/* Price tag */}
        <line x1={pad.l} x2={width - pad.r + 8} y1={y(last.c)} y2={y(last.c)} stroke={frozen ? colors.cream : up} strokeWidth={2} strokeDasharray="8 8" opacity={frozen ? 0.6 : 0.4} />
        <rect x={width - pad.r + 10} y={y(last.c) - 20} width={pad.r - 22} height={40} rx={8} fill={up} />
        <text x={width - pad.r / 2 - 1} y={y(last.c) + 8} textAnchor="middle" fontFamily={fonts.body} fontWeight={800} fontSize={22} fill={colors.ink}>
          {last.c.toFixed(1)}
        </text>
      </svg>
      {/* Header */}
      <div style={{ position: "absolute", top: 22, left: 28, right: 28, display: "flex", justifyContent: "space-between", fontFamily: fonts.body, fontWeight: 800 }}>
        <span style={{ fontSize: 28, color: colors.cream }}>{label}</span>
        <span style={{ fontSize: 30, color: up }}>▲ +{pct.toFixed(1)}%</span>
      </div>
    </div>
  );
};
