// Crowd: a generated group of Persons (deterministic from `seed`) with mixed
// expressions, individual idle motion and a staggered pop-in.
//   layout "cluster" — rows of people, back rows smaller (protest / gathering)
//   layout "queue"   — a single-file line receding toward a point (a queue)
// mood "angry" mixes angry/shocked faces and raised fists; "worried" mixes
// worried/neutral faces with people checking phones.
import React, { useMemo } from "react";
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Accessory, Expression, Hair, Outfit, PersonFigure, PersonFigureProps, Pose } from "./Person";
import { Keyframe } from "../lib/keyframes";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type CrowdProps = ThemableProps & {
  count?: number;
  layout?: "cluster" | "queue";
  width?: number;
  height?: number;
  /** Height in px of a front-row person. */
  personHeight?: number;
  mood?: "angry" | "worried" | "happy";
  /** Frame people start popping in, and stagger between them. */
  appearAt?: number;
  stagger?: number;
  /** Queue only: where the line leads to (px within the box). */
  queueTarget?: { x: number; y: number };
  fail?: number;
  seed?: string;
};

type Member = { x: number; ground: number; scale: number; props: PersonFigureProps; order: number };

export const Crowd: React.FC<CrowdProps> = ({
  count = 9,
  layout = "cluster",
  width = 1000,
  height = 500,
  personHeight = 300,
  mood = "worried",
  appearAt = 0,
  stagger = 4,
  queueTarget,
  fail = 0,
  seed = "crowd",
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { skinTones, outfitColors } = useTheme(themable);

  const members = useMemo<Member[]>(() => {
    const r = (k: string) => random(`${seed}-${k}`);
    const pick = <T,>(arr: readonly T[], k: string) => arr[Math.floor(r(k) * arr.length) % arr.length];
    const list: Member[] = [];
    for (let i = 0; i < count; i++) {
      const outfit = pick<Outfit>(["tshirt", "tshirt", "dress", "shirtTie"], `o${i}`);
      const hair = pick<Hair>(["short", "fade", "puffs", "bun", "short"], `h${i}`);
      const accessory: Accessory = outfit === "dress" && r(`w${i}`) > 0.4 ? "headwrap" : r(`g${i}`) > 0.85 ? "glasses" : "none";
      let x: number;
      let ground: number;
      let scale: number;
      if (layout === "queue") {
        const t = i / Math.max(1, count - 1);
        const target = queueTarget ?? { x: width * 0.2, y: height * 0.45 };
        x = interpolate(t, [0, 1], [width * 0.88, target.x]);
        ground = interpolate(t, [0, 1], [height - 10, target.y]);
        scale = interpolate(t, [0, 1], [1, 0.6]);
      } else {
        const rows = 3;
        const row = i % rows; // 0 = front
        const perRow = Math.ceil(count / rows);
        const idx = Math.floor(i / rows);
        const span = width * (0.92 - row * 0.08);
        x = width / 2 - span / 2 + (span / Math.max(1, perRow - 1)) * idx + (row % 2 ? 40 : 0) + (r(`x${i}`) - 0.5) * 30;
        ground = height - 10 - row * personHeight * 0.16;
        scale = 1 - row * 0.14;
      }
      let expression: Expression;
      let pose: PersonFigureProps["pose"] = "idle";
      const roll = r(`e${i}`);
      if (mood === "angry") {
        expression = roll > 0.25 ? "angry" : "shocked";
        if (r(`p${i}`) > 0.4) {
          // Fists pump on individual rhythms.
          const period = 34 + Math.floor(r(`q${i}`) * 20);
          const kfs: Keyframe<Pose>[] = [];
          for (let f = Math.floor(r(`s${i}`) * period); f < 2000; f += period) {
            kfs.push({ at: f, value: "fist" }, { at: f + Math.floor(period * 0.55), value: "idle" });
          }
          pose = kfs;
        } else if (roll < 0.25) pose = "cheeks";
      } else if (mood === "worried") {
        expression = roll > 0.3 ? "worried" : "neutral";
        pose = r(`p${i}`) > 0.55 ? "phone" : r(`p${i}`) > 0.4 ? "shrug" : "idle";
      } else {
        expression = roll > 0.5 ? "excited" : "happy";
        pose = r(`p${i}`) > 0.5 ? "cheer" : "phoneOne";
      }
      list.push({
        x,
        ground,
        scale,
        order: i,
        props: {
          skinTone: pick(skinTones, `k${i}`),
          outfit,
          outfitColor: pick(outfitColors, `c${i}`),
          accentColor: pick(outfitColors, `a${i}`),
          pattern: r(`t${i}`) > 0.75 ? "kente" : "none",
          hair,
          accessory,
          expression,
          pose,
          seed: i * 3 + 1,
          flip: r(`f${i}`) > 0.5,
        },
      });
    }
    // Draw back-to-front.
    return list.sort((a, b) => a.ground - b.ground);
  }, [count, layout, width, height, personHeight, mood, queueTarget, seed, skinTones, outfitColors]);

  const s0 = personHeight / 400;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      {members.map((m) => {
        const pop = spring({ frame: frame - appearAt - m.order * stagger, fps, config: { damping: 13, mass: 0.6 } });
        if (pop <= 0.001) return null;
        const s = s0 * m.scale;
        const shuffle = Math.sin((frame + m.order * 23) / 45) * 4;
        return (
          <g key={m.order} transform={`translate(${m.x - 100 * s + shuffle} ${m.ground - 400 * s + (1 - pop) * 80}) scale(${s})`} opacity={Math.min(1, pop * 1.5)}>
            <PersonFigure {...m.props} fail={fail} />
          </g>
        );
      })}
    </svg>
  );
};
