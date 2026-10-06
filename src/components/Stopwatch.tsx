// Stopwatch: a big analogue stopwatch with a ticking second hand (each tick
// snaps with a small overshoot; at high speed it becomes a sweep), a minute
// sub-dial and a digital readout.
//
// Time is driven by `runs`. Each run starts (resets to 0:00) at frame `at`,
// runs at `speed` stopwatch-seconds per real second (a number, or keyframes
// relative to the run start for a time-lapse ramp), and fires an event every
// `eventEvery` stopwatch seconds. On each event the crown clicks and the rim
// pulses; `renderEvent` can draw extra things. `stopwatchEvents()` gives the
// same event frames to the rest of a scene (e.g. to slide a plate per tick).
import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { pop } from "../lib/motion";
import { alpha, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type StopwatchRun = {
  /** Frame this run starts (the watch resets to 0). */
  at: number;
  /** Stopwatch seconds per real second, or keyframes ({ at: frames since run start }). */
  speed?: number | { at: number; value: number }[];
  /** Fire an event every N stopwatch seconds. */
  eventEvery?: number;
};

export type StopwatchEvent = { frame: number; run: number; index: number; since: number };

export type StopwatchProps = ThemableProps & {
  size?: number;
  runs?: StopwatchRun[];
  /** Frame the watch pops in. */
  appearAt?: number;
  exitAt?: number;
  /** Colour of the second hand and event pulse. */
  handColor?: string;
  faceColor?: string;
  /** Draws extra content for each fired event (in the watch's px box). */
  renderEvent?: (e: StopwatchEvent) => React.ReactNode;
  /** Show the digital readout. */
  readout?: boolean;
  style?: React.CSSProperties;
};

const speedAt = (run: StopwatchRun, f: number) => {
  const s = run.speed ?? 1;
  if (typeof s === "number") return s;
  return interpolate(f, s.map((k) => k.at), s.map((k) => k.value), { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

/** Simulates the runs up to `frame`: current time/speed and every event fired so far. */
export const simulateStopwatch = (runs: StopwatchRun[], frame: number, fps: number) => {
  const events: StopwatchEvent[] = [];
  let time = 0;
  let speed = 0;
  let runIdx = -1;
  runs.forEach((run, r) => {
    if (run.at > frame) return;
    const end = Math.min(frame, r + 1 < runs.length ? runs[r + 1].at : Infinity);
    runIdx = r;
    time = 0;
    let fired = 0;
    for (let f = run.at; f < end; f++) {
      speed = speedAt(run, f - run.at);
      time += speed / fps;
      if (run.eventEvery) {
        const n = Math.floor(time / run.eventEvery + 1e-9);
        while (fired < n) {
          events.push({ frame: f + 1, run: r, index: fired, since: frame - (f + 1) });
          fired++;
        }
      }
    }
    if (end === run.at) speed = speedAt(run, 0);
  });
  return { time, speed, run: runIdx, events };
};

export const stopwatchEvents = (runs: StopwatchRun[], frame: number, fps: number) => simulateStopwatch(runs, frame, fps).events;

const fmt = (t: number) => {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const Stopwatch: React.FC<StopwatchProps> = ({
  size = 520,
  runs = [{ at: 0 }],
  appearAt = 0,
  exitAt,
  handColor,
  faceColor,
  renderEvent,
  readout = true,
  style,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  if (frame < appearAt) return null;
  const p = pop(frame, fps, appearAt);
  const exit = exitAt === undefined ? 1 : interpolate(frame, [exitAt, exitAt + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (exit <= 0) return null;

  const { time, speed, events } = simulateStopwatch(runs, frame, fps);
  const hand = handColor ?? colors.red;
  const face = faceColor ?? colors.cream;
  // Tick: each second snaps over ~0.15s real time with overshoot; fast speeds sweep.
  const whole = Math.floor(time);
  const frac = time - whole;
  const snapWindow = Math.min(1, 0.15 * Math.max(0.001, speed));
  const tick = Easing.out(Easing.back(2.2))(Math.min(1, frac / snapWindow));
  const secAngle = (whole + tick) * 6;
  const minAngle = (time / 60) * 30 * 2; // sub-dial: one turn per 6 minutes

  const last = events.length ? events[events.length - 1] : undefined;
  const sinceEvent = last ? frame - last.frame : Infinity;
  const press = sinceEvent < 8 ? Math.sin((sinceEvent / 8) * Math.PI) : 0;
  const pulse = sinceEvent < 14 ? 1 - sinceEvent / 14 : 0;
  const bob = Math.sin(frame / 25) * 1.5;

  return (
    <div style={{ position: "relative", width: size, height: size * 1.16, transform: `scale(${p * (0.85 + 0.15 * exit)}) rotate(${bob}deg)`, opacity: exit, ...style }}>
      <svg width={size} height={size * 1.16} viewBox="0 0 500 580" style={{ overflow: "visible" }}>
        {/* Crown + side buttons */}
        <g transform={`translate(0 ${press * 14})`}>
          <rect x={222} y={8} width={56} height={40} rx={10} fill={colors.gold} />
          <rect x={232} y={44} width={36} height={30} fill={shade(colors.gold, 0.25)} />
        </g>
        <rect x={232} y={44} width={36} height={34} fill={shade(colors.gold, 0.3)} />
        <g transform="rotate(42 250 330)">
          <rect x={234} y={64} width={32} height={34} rx={6} fill={shade(colors.gold, 0.15)} />
        </g>
        <g transform="rotate(-42 250 330)">
          <rect x={234} y={64} width={32} height={34} rx={6} fill={shade(colors.gold, 0.15)} />
        </g>
        {/* Case */}
        <circle cx={250} cy={330} r={238} fill={colors.ink} />
        <circle cx={250} cy={330} r={226} fill={shade(colors.gold, 0.1)} />
        <circle cx={250} cy={330} r={212} fill={face} />
        <circle cx={250} cy={330} r={212} fill="none" stroke={hand} strokeWidth={10 + pulse * 18} opacity={pulse} />
        {/* Ticks */}
        {Array.from({ length: 60 }, (_, i) => {
          const big = i % 5 === 0;
          const a = (i * 6 * Math.PI) / 180;
          const r1 = big ? 170 : 186;
          return (
            <line
              key={i}
              x1={250 + Math.sin(a) * r1}
              y1={330 - Math.cos(a) * r1}
              x2={250 + Math.sin(a) * 198}
              y2={330 - Math.cos(a) * 198}
              stroke={colors.ink}
              strokeWidth={big ? 7 : 3}
              strokeLinecap="round"
            />
          );
        })}
        {[0, 15, 30, 45].map((n) => {
          const a = (n * 6 * Math.PI) / 180;
          return (
            <text key={n} x={250 + Math.sin(a) * 140} y={330 - Math.cos(a) * 140 + 16} textAnchor="middle" fontFamily={fonts.headline} fontSize={44} fill={colors.ink}>
              {n === 0 ? 60 : n}
            </text>
          );
        })}
        {/* Minute sub-dial */}
        <circle cx={250} cy={252} r={42} fill={shade(face, 0.07)} stroke={alpha(colors.ink, 0.4)} strokeWidth={3} />
        <line x1={250} y1={252} x2={250 + Math.sin((minAngle * Math.PI) / 180) * 32} y2={252 - Math.cos((minAngle * Math.PI) / 180) * 32} stroke={colors.ink} strokeWidth={5} strokeLinecap="round" />
        {/* Digital readout */}
        {readout ? (
          <g>
            <rect x={180} y={384} width={140} height={54} rx={10} fill={colors.ink} />
            <text x={250} y={426} textAnchor="middle" fontFamily={fonts.body} fontWeight={800} fontSize={36} fill={tint(colors.gold, 0.1)} style={{ fontVariantNumeric: "tabular-nums" }}>
              {fmt(time)}
            </text>
          </g>
        ) : null}
        {/* Second hand */}
        <g transform={`rotate(${secAngle} 250 330)`}>
          <line x1={250} y1={372} x2={250} y2={140} stroke={hand} strokeWidth={8} strokeLinecap="round" />
          <circle cx={250} cy={372} r={10} fill={hand} />
        </g>
        <circle cx={250} cy={330} r={16} fill={colors.ink} />
        <circle cx={250} cy={330} r={7} fill={hand} />
        {/* Glass highlight */}
        <path d="M110 220 A170 170 0 0 1 250 130" stroke="#fff" strokeOpacity={0.35} strokeWidth={14} fill="none" strokeLinecap="round" />
      </svg>
      {renderEvent ? events.filter((e) => frame - e.frame < 60).map((e) => <React.Fragment key={`${e.run}-${e.index}`}>{renderEvent({ ...e, since: frame - e.frame })}</React.Fragment>) : null}
    </div>
  );
};
