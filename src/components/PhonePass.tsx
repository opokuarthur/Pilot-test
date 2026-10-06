// PhonePass: a row of Persons. A glowing phone arcs from one person's hand to
// the next. Each person smiles when the phone arrives, then turns worried a
// little later. Shows how a scheme spreads through people you trust.
import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Expression, PersonFigure, PersonFigureProps, Pose } from "./Person";
import { Keyframe } from "../lib/keyframes";
import { mix } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type PhonePassProps = ThemableProps & {
  people: PersonFigureProps[];
  /** SVG box size in px. */
  width?: number;
  height?: number;
  /** Rendered person height in px. */
  personHeight?: number;
  /** Frame the first person receives the phone. */
  startAt?: number;
  /** Frames each person holds the phone. */
  holdFrames?: number;
  /** Frames the phone spends in the air between people. */
  travelFrames?: number;
  /** Frames after receiving before a person turns worried. */
  worryDelay?: number;
  /** Frame the phone screen turns red ("pending"). */
  phoneRedAt?: number;
  /** Per-person "fail" (desaturation) start frame; default: none. */
  failAt?: number;
  /** Leave a dotted arc where the phone travelled (the chain of trust). */
  showTrail?: boolean;
};

// Phone anchor points in Person-local units (see POSES in Person.tsx).
const HOLD = { x: 118, y: 214 };
const REACH = { x: 226, y: 192 };

export const PhonePass: React.FC<PhonePassProps> = ({
  people,
  width = 1080,
  height = 640,
  personHeight = 470,
  startAt = 30,
  holdFrames = 70,
  travelFrames = 24,
  worryDelay = 80,
  phoneRedAt,
  failAt,
  showTrail = true,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme(themable);
  const n = people.length;
  const s = personHeight / 400;
  const margin = 40;
  const slot = (width - margin * 2) / n;
  const groundY = height - 20;
  const originX = (i: number) => margin + slot * (i + 0.5) - 100 * s;
  const originY = groundY - 400 * s;
  const toGlobal = (i: number, p: { x: number; y: number }) => ({ x: originX(i) + p.x * s, y: originY + p.y * s });

  const step = holdFrames + travelFrames;
  const arrive = (i: number) => startAt + i * step;
  const depart = (i: number) => arrive(i) + holdFrames;

  // Where is the phone?
  let phone = toGlobal(0, HOLD);
  const phoneVisible = frame >= startAt - 12;
  if (frame < startAt) {
    // Drops into the first person's hand.
    const p = interpolate(frame, [startAt - 12, startAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    phone = { x: phone.x, y: phone.y - (1 - p) * 140 };
  } else {
    for (let i = 0; i < n; i++) {
      if (frame >= arrive(i)) phone = toGlobal(i, HOLD);
      if (i < n - 1 && frame >= depart(i) && frame < arrive(i + 1)) {
        const a = toGlobal(i, REACH);
        const b = toGlobal(i + 1, HOLD);
        const t = Easing.inOut(Easing.cubic)((frame - depart(i)) / travelFrames);
        phone = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - Math.sin(t * Math.PI) * 120 };
      }
    }
  }
  const red = phoneRedAt === undefined ? 0 : interpolate(frame, [phoneRedAt, phoneRedAt + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const screen = mix(colors.gold, colors.red, red);
  const spin = frame * 4;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      {showTrail
        ? people.slice(0, -1).map((_, i) => {
            const a = toGlobal(i, REACH);
            const b = toGlobal(i + 1, HOLD);
            const p = interpolate(frame, [depart(i), arrive(i + 1)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            if (p <= 0) return null;
            // Dots along the same quadratic arc the phone flew, revealed as it travels.
            const cx = (a.x + b.x) / 2;
            const cy = Math.min(a.y, b.y) - 240;
            const dots = 16;
            return (
              <g key={i} fill={colors.gold} opacity={0.6}>
                {Array.from({ length: dots + 1 }, (_, k) => {
                  const t = k / dots;
                  if (t > p) return null;
                  const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cx + t * t * b.x;
                  const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cy + t * t * b.y;
                  return <circle key={k} cx={x} cy={y} r={4} />;
                })}
              </g>
            );
          })
        : null}
      {people.map((person, i) => {
        const pose: Keyframe<Pose>[] = [
          { at: 0, value: "idle" },
          { at: arrive(i) - 8, value: "phoneOne" },
          ...(i < n - 1
            ? [
                { at: depart(i) - 4, value: "reach" as Pose },
                { at: depart(i) + travelFrames + 6, value: "idle" as Pose },
              ]
            : []),
        ];
        const expression: Keyframe<Expression>[] = [
          { at: 0, value: "neutral" },
          { at: arrive(i), value: "happy" },
          { at: arrive(i) + worryDelay, value: "worried" },
        ];
        const fail = failAt === undefined ? 0 : interpolate(frame, [failAt + i * 6, failAt + i * 6 + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <g key={i} transform={`translate(${originX(i)} ${originY}) scale(${s})`}>
            <PersonFigure {...person} pose={pose} expression={expression} holdingPhone={false} seed={i + 1} fail={fail} />
          </g>
        );
      })}
      {phoneVisible ? (
        <g transform={`translate(${phone.x} ${phone.y}) rotate(${Math.sin(frame / 8) * 6})`}>
          <circle r={56} fill={screen} opacity={0.2} />
          <circle r={36} fill={screen} opacity={0.25} />
          <rect x={-22} y={-38} width={44} height={76} rx={9} fill="#111" />
          <rect x={-17} y={-32} width={34} height={62} rx={5} fill={screen} />
          {red > 0.5 ? (
            <g transform="translate(0 0)">
              <circle r={9} stroke="#fff" strokeOpacity={0.3} strokeWidth={3} fill="none" />
              <path d="M0,-9 A9,9 0 0 1 9,0" stroke="#fff" strokeWidth={3} fill="none" transform={`rotate(${spin})`} />
            </g>
          ) : (
            <path d="M-8,6 L0,-4 L8,6" stroke="#111" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </g>
      ) : null}
    </svg>
  );
};
