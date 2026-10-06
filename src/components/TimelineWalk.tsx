// TimelineWalk: a faceless figure (always a solid silhouette seen from
// behind) walks left-to-right past a sequence of scene "stops". The camera
// glides from stop to stop; the figure's walk cycle runs while it moves and
// settles to idle at each stop, where a TextSlam label slams in. A dotted
// timeline runs along the ground with a dot per stop that fills when reached.
//   stops={[{ label: "JAMESTOWN", node: <Street/> }, …]} arrivals={[60, 250, …]}
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Person } from "./Person";
import { TextSlam } from "./TextSlam";
import { alpha } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type TimelineStop = {
  label: string;
  /** Scene art, drawn in a stopWidth × stopHeight box centred on the stop. */
  node: React.ReactNode;
  labelColor?: string;
  /** Solid plate behind the label. */
  labelPlate?: string;
};

export type TimelineWalkProps = ThemableProps & {
  stops: TimelineStop[];
  /** Frame the figure arrives at each stop. */
  arrivals: number[];
  /** Frames of walking before each arrival. */
  walkFrames?: number;
  /** World distance between stops (px). */
  spacing?: number;
  stopWidth?: number;
  stopHeight?: number;
  /** Bottom of the stop art and the figure's feet (px). */
  groundY?: number;
  figureHeight?: number;
  /** Where the figure stands on screen at each stop (px). */
  figureX?: number;
  figureColor?: string;
  rimLight?: string;
  /** Frames per stride. */
  stride?: number;
  labelY?: number;
  labelSize?: number;
  /** Frame the last label exits (others exit when walking resumes). */
  exitAt?: number;
};

export const TimelineWalk: React.FC<TimelineWalkProps> = ({
  stops,
  arrivals,
  walkFrames = 70,
  spacing = 1100,
  stopWidth = 880,
  stopHeight = 760,
  groundY = 1180,
  figureHeight = 440,
  figureX = 300,
  figureColor,
  rimLight,
  stride = 22,
  labelY = 260,
  labelSize = 120,
  exitAt,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme(themable);
  const ease = Easing.inOut(Easing.cubic);

  // Camera position (world px) and whether we're walking.
  let cam = 0;
  let walking = false;
  let figureEnter = 0; // extra screen offset while walking in at the start
  const a0 = arrivals[0];
  if (frame < a0) {
    const p = interpolate(frame, [a0 - walkFrames, a0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    figureEnter = -(figureX + 300) * (1 - p);
    walking = p < 1;
  }
  for (let i = 1; i < arrivals.length; i++) {
    const s = arrivals[i] - walkFrames;
    if (frame >= s) {
      const p = interpolate(frame, [s, arrivals[i]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
      cam = (i - 1 + p) * spacing;
      if (p < 1) walking = true;
    }
  }

  const figW = (figureHeight * 320) / 430;
  const stopCx = 540;

  return (
    <AbsoluteFill>
      {/* Stops */}
      {stops.map((st, i) => {
        const sx = stopCx + i * spacing - cam;
        if (sx < -stopWidth || sx > 1080 + stopWidth) return null;
        return (
          <div key={i} style={{ position: "absolute", left: sx - stopWidth / 2, top: groundY - stopHeight, width: stopWidth, height: stopHeight }}>
            {st.node}
          </div>
        );
      })}
      {/* Ground + timeline */}
      <div style={{ position: "absolute", left: 0, right: 0, top: groundY, height: 1920 - groundY, background: alpha(colors.ink, 0.55) }} />
      <svg width={1080} height={80} style={{ position: "absolute", left: 0, top: groundY + 30 }}>
        <line x1={-40} x2={1120} y1={20} y2={20} stroke={alpha(colors.cream, 0.35)} strokeWidth={6} strokeDasharray="2 22" strokeLinecap="round" strokeDashoffset={cam} />
        {stops.map((_, i) => {
          const x = stopCx + i * spacing - cam;
          const reached = frame >= arrivals[i];
          return (
            <g key={i}>
              <circle cx={x} cy={20} r={16} fill={colors.navy} stroke={colors.gold} strokeWidth={5} />
              {reached ? <circle cx={x} cy={20} r={9} fill={colors.gold} /> : null}
            </g>
          );
        })}
      </svg>
      {/* The figure: always a silhouette, from behind */}
      <Person
        x={figureX - figW / 2 + figureEnter}
        y={groundY + 12}
        height={figureHeight}
        view="back"
        silhouette={figureColor ?? colors.ink}
        rimLight={rimLight ?? alpha(colors.gold, 0.9)}
        walk={walking ? stride : 0}
        hair="fade"
      />
      {/* Labels */}
      {stops.map((st, i) => {
        const next = arrivals[i + 1] !== undefined ? arrivals[i + 1] - walkFrames : exitAt;
        return (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: labelY, display: "flex", justifyContent: "center" }}>
            <TextSlam text={st.label} at={arrivals[i] - 4} exitAt={next} fontSize={labelSize} color={st.labelColor} plate={st.labelPlate} rotate={i % 2 ? 2 : -2} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
