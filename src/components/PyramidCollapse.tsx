// PyramidCollapse — the signature visual. Timeline (all frames configurable):
//   buildAt    rows of little person-busts drop in, top first, with link lines
//   flowAt     gold coins stream UP from the bottom row, through each "recruiter",
//              to the person at the top (who glows brighter as money arrives)
//   stallAt    coins stop; a dashed "ghost" row of people who never joined appears
//   emptyAt    the bottom row (the last people in) greys out and drops away
//   collapseAt the pyramid shakes, then falls row by row under gravity, bounces,
//              lands in a grey heap; the top person's coins scatter; dust puffs
// Physics is analytic (no state), so any frame renders identically.
import React from "react";
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Expression, FACES, FaceFeatures } from "./Person";
import { Keyframe, lerpObj, resolveKeyframes } from "../lib/keyframes";
import { failFilter } from "../lib/motion";
import { alpha, shade } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type PyramidCollapseProps = ThemableProps & {
  /** Rendered width in px (height = width × 1.06). */
  width?: number;
  rows?: number;
  buildAt?: number;
  rowStagger?: number;
  flowAt?: number;
  stallAt?: number;
  emptyAt?: number;
  collapseAt?: number;
  /** Frames between coins. */
  coinInterval?: number;
  /** Label under the bottom row while money flows. */
  flowLabel?: string;
  /** Label on the ghost row. */
  stallLabel?: string;
};

const VB_W = 1000;
const VB_H = 1060;
const TOP_Y = 170;
const DX = 170;
const DY = 150;
const GROUND = 1010;
const G = 1.5; // gravity, units/frame²

const pos = (r: number, i: number) => ({ x: VB_W / 2 + (i - r / 2) * DX, y: TOP_Y + r * DY });
const parentOf = (r: number, i: number) => Math.round((i * (r - 1)) / r);

/** Small person bust; base centre at (0,0), head centre at (0,-88). */
const Bust: React.FC<{ skin: string; cloth: string; expression: Keyframe<Expression>[]; frame: number; seed: number; ghost?: boolean; ghostColor?: string }> = ({
  skin,
  cloth,
  expression,
  frame,
  seed,
  ghost,
  ghostColor = "#fff",
}) => {
  if (ghost) {
    return (
      <g fill="none" stroke={ghostColor} strokeWidth={4} strokeDasharray="10 9">
        <path d="M-56,0 L-56,-26 Q-56,-52 -28,-56 L28,-56 Q56,-52 56,-26 L56,0 Z" />
        <circle cx={0} cy={-88} r={32} />
      </g>
    );
  }
  const ex = resolveKeyframes(expression, frame, 8);
  const face = lerpObj(FACES[ex.from], FACES[ex.to], ex.t);
  const bp = (frame + seed * 17) % (90 + (seed % 5) * 11);
  const blink = bp < 6 ? Math.abs(bp - 3) / 3 : 1;
  return (
    <g>
      <path d="M-56,0 L-56,-26 Q-56,-52 -28,-56 L28,-56 Q56,-52 56,-26 L56,0 Z" fill={cloth} />
      <path d="M20,-56 Q56,-52 56,-26 L56,0 L30,0 Z" fill="#000" opacity={0.12} />
      <rect x={-11} y={-66} width={22} height={16} rx={6} fill={shade(skin, 0.2)} />
      <circle cx={0} cy={-88} r={32} fill={skin} />
      <g transform="translate(0 -88) scale(0.696) translate(-100 -100)">
        <FaceFeatures face={face} blink={blink} skin={skin} />
      </g>
    </g>
  );
};

/** Free fall from y0 to ground with one bounce. t = frames since release. */
const fall = (t: number, y0: number, ground: number) => {
  const drop = Math.max(1, ground - y0);
  const tl = Math.sqrt((2 * drop) / G);
  if (t <= tl) return { y: y0 + 0.5 * G * t * t, landed: false, tLand: tl };
  const h = drop * 0.12;
  const tb = 2 * Math.sqrt((2 * h) / G);
  const u = t - tl;
  if (u <= tb) {
    const v = Math.sqrt(2 * G * h);
    return { y: ground - (v * u - 0.5 * G * u * u), landed: true, tLand: tl };
  }
  return { y: ground, landed: true, tLand: tl };
};

export const PyramidCollapse: React.FC<PyramidCollapseProps> = ({
  width = 900,
  rows = 5,
  buildAt = 0,
  rowStagger = 22,
  flowAt = 140,
  stallAt = 380,
  emptyAt = 470,
  collapseAt = 520,
  coinInterval = 6,
  flowLabel = "NEW PEOPLE PAY IN",
  stallLabel = "NO NEW PEOPLE",
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts, skinTones, outfitColors } = useTheme(themable);
  const bottom = rows - 1;

  const tokens: { r: number; i: number; key: string }[] = [];
  for (let r = 0; r < rows; r++) for (let i = 0; i <= r; i++) tokens.push({ r, i, key: `${r}-${i}` });

  // --- Coins flowing up --------------------------------------------------------
  const pathFor = (src: number) => {
    const pts: { x: number; y: number }[] = [];
    let i = src;
    for (let r = bottom; r >= 0; r--) {
      const p = pos(r, i);
      pts.push({ x: p.x, y: p.y - 40 });
      if (r > 0) i = parentOf(r, i);
    }
    return pts;
  };
  const along = (pts: { x: number; y: number }[], t: number) => {
    const segs = pts.slice(1).map((p, k) => Math.hypot(p.x - pts[k].x, p.y - pts[k].y));
    const total = segs.reduce((a, b) => a + b, 0);
    let d = t * total;
    for (let k = 0; k < segs.length; k++) {
      if (d <= segs[k]) {
        const f = d / segs[k];
        return { x: pts[k].x + (pts[k + 1].x - pts[k].x) * f, y: pts[k].y + (pts[k + 1].y - pts[k].y) * f };
      }
      d -= segs[k];
    }
    return pts[pts.length - 1];
  };
  const coinTravel = 50;
  const coins: { x: number; y: number; spin: number; key: number }[] = [];
  let arrived = 0;
  for (let j = 0; flowAt + j * coinInterval < stallAt; j++) {
    const born = flowAt + j * coinInterval;
    const p = (frame - born) / coinTravel;
    if (p >= 1) arrived++;
    if (p < 0 || p >= 1) continue;
    const src = Math.floor(random(`coin${j}`) * rows);
    const pt = along(pathFor(src), Easing.inOut(Easing.quad)(p));
    coins.push({ ...pt, spin: Math.cos((frame + j * 7) / 4), key: j });
  }

  // --- Global states -------------------------------------------------------------
  const fail = interpolate(frame, [emptyAt, collapseAt + 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const linkFade = interpolate(frame, [collapseAt - 10, collapseAt + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flowLabelIn = interpolate(frame, [flowAt + 10, flowAt + 25, stallAt - 5, stallAt + 5], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ghostIn = spring({ frame: frame - stallAt, fps, config: { damping: 14 } });
  const ghostOut = interpolate(frame, [collapseAt - 10, collapseAt + 5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = Math.min(1, arrived / 30);
  const impact = frame - collapseAt - 26;
  const quake = impact > 0 && impact < 24 ? Math.sin(impact * 2.3) * 9 * (1 - impact / 24) : 0;

  const tokenState = (r: number, i: number) => {
    const base = pos(r, i);
    const appear = spring({ frame: frame - buildAt - r * rowStagger - i * 3, fps, config: { damping: 12, mass: 0.6 } });
    let x = base.x;
    let y = base.y + 55 - (1 - appear) * 120;
    let rot = 0;
    let opacity = Math.min(1, appear * 1.4);
    let dust: { x: number; y: number; t: number } | null = null;

    if (r === bottom && frame >= emptyAt + i * 4) {
      // The last people in drop away and vanish.
      const t = frame - emptyAt - i * 4;
      y += 0.5 * G * t * t * 0.6;
      rot = (i - r / 2) * t * 0.6;
      opacity *= interpolate(t, [0, 26], [1, 0], { extrapolateRight: "clamp" });
    } else if (r < bottom) {
      const release = collapseAt + (bottom - 1 - r) * 5 + random(`rel${r}${i}`) * 5;
      if (frame < release && frame > collapseAt - 26) {
        const amp = interpolate(frame, [collapseAt - 26, release], [0, 7], { extrapolateRight: "clamp" });
        x += Math.sin(frame * 2.7 + i * 3 + r) * amp;
        rot = Math.sin(frame * 2.1 + r) * amp * 0.6;
      } else if (frame >= release) {
        const t = frame - release;
        const landX = base.x * 0.72 + (VB_W / 2) * 0.28 + (random(`lx${r}${i}`) - 0.5) * 150;
        const heap = Math.max(0, 150 - Math.abs(landX - VB_W / 2) * 0.45) * (0.45 + random(`hp${r}${i}`) * 0.55);
        const ground = GROUND - heap;
        const f = fall(t, base.y + 55, ground);
        const k = Math.min(1, t / (f.tLand + 8));
        x = base.x + (landX - base.x) * Easing.out(Easing.quad)(k);
        y = f.y;
        const finalRot = (random(`rot${r}${i}`) - 0.5) * 170;
        rot = finalRot * Easing.out(Easing.cubic)(k);
        if (f.landed) dust = { x, y, t: t - f.tLand };
      }
    }
    return { x, y, rot, opacity, dust, appear };
  };

  const exprFor = (r: number): Keyframe<Expression>[] => {
    if (r === 0) return [{ at: 0, value: "happy" }, { at: flowAt + 40, value: "excited" }, { at: collapseAt - 20, value: "shocked" }];
    if (r === bottom) return [{ at: 0, value: "happy" }, { at: flowAt, value: "neutral" }, { at: stallAt + 10, value: "worried" }, { at: emptyAt - 6, value: "shocked" }];
    return [{ at: 0, value: "happy" }, { at: stallAt + 30 + r * 8, value: "worried" }, { at: collapseAt - 10, value: "shocked" }];
  };

  const states = new Map(tokens.map((t) => [t.key, tokenState(t.r, t.i)]));

  // Coins scattering from the top on collapse.
  const scatter = frame >= collapseAt
    ? Array.from({ length: 14 }, (_, k) => {
        const t = frame - collapseAt - 4;
        if (t < 0) return null;
        const vx = (random(`sx${k}`) - 0.5) * 16;
        const vy = -6 - random(`sy${k}`) * 10;
        const y = Math.min(GROUND - 6, pos(0, 0).y + vy * t + 0.5 * G * t * t);
        return { x: pos(0, 0).x + vx * Math.min(t, 40), y, key: k };
      }).filter(Boolean)
    : [];

  return (
    <svg
      width={width}
      height={(width * VB_H) / VB_W}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={{ overflow: "visible", filter: failFilter(fail), transform: `translateY(${quake}px)` }}
    >
      <defs>
        <radialGradient id="pyrGlow">
          <stop offset="0" stopColor={colors.gold} stopOpacity={0.55} />
          <stop offset="1" stopColor={colors.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* Ground line */}
      <line x1={40} x2={VB_W - 40} y1={GROUND + 4} y2={GROUND + 4} stroke={alpha(colors.cream, 0.18)} strokeWidth={4} strokeLinecap="round" />

      {/* Top person's glow grows as money arrives */}
      <circle cx={pos(0, 0).x} cy={pos(0, 0).y + 10} r={110 + glow * 90 + Math.sin(frame / 6) * 6} fill="url(#pyrGlow)" opacity={glow * linkFade} />

      {/* Recruitment links */}
      <g opacity={linkFade}>
        {tokens
          .filter((t) => t.r > 0)
          .map((t) => {
            const a = pos(t.r, t.i);
            const b = pos(t.r - 1, parentOf(t.r, t.i));
            const s = states.get(t.key)!;
            const gone = t.r === bottom && frame >= emptyAt ? interpolate(frame, [emptyAt, emptyAt + 12], [1, 0], { extrapolateRight: "clamp" }) : 1;
            return <line key={t.key} x1={a.x} y1={a.y - 40} x2={b.x} y2={b.y - 40} stroke={alpha(colors.gold, 0.35)} strokeWidth={5} strokeDasharray="2 12" strokeLinecap="round" opacity={s.appear * gone} />;
          })}
      </g>

      {/* Ghost row: the people who never come */}
      {frame >= stallAt ? (
        <g opacity={ghostIn * ghostOut}>
          {Array.from({ length: rows + 1 }, (_, i) => {
            const p = pos(rows, i);
            return (
              <g key={i} transform={`translate(${p.x} ${p.y + 55 + (1 - ghostIn) * 30})`}>
                <Bust skin="" cloth="" expression={[]} frame={frame} seed={i} ghost ghostColor={alpha(colors.cream, 0.45)} />
              </g>
            );
          })}
          <g transform={`translate(${VB_W / 2} ${pos(rows, 0).y - 30}) scale(${0.8 + 0.2 * ghostIn})`}>
            <rect x={-200} y={-34} width={400} height={64} rx={10} fill={colors.red} />
            <text textAnchor="middle" y={14} fontFamily={fonts.headline} fontSize={44} letterSpacing={2} fill={colors.cream}>
              {stallLabel}
            </text>
          </g>
        </g>
      ) : null}

      {/* Flow label */}
      {flowLabelIn > 0 ? (
        <text x={VB_W / 2} y={pos(bottom, 0).y + 120} textAnchor="middle" fontFamily={fonts.body} fontWeight={800} fontSize={34} letterSpacing={3} fill={colors.gold} opacity={flowLabelIn}>
          ↑ {flowLabel} ↑
        </text>
      ) : null}

      {/* People */}
      {tokens.map((t) => {
        const s = states.get(t.key)!;
        if (s.opacity <= 0.01) return null;
        const n = t.r * 3 + t.i;
        return (
          <g key={t.key}>
            {s.dust && s.dust.t < 22 ? (
              <g opacity={0.35 * (1 - s.dust.t / 22)} fill={colors.cream}>
                <circle cx={s.x - 40} cy={s.y - 6} r={10 + s.dust.t * 2} />
                <circle cx={s.x + 40} cy={s.y - 6} r={10 + s.dust.t * 2.2} />
              </g>
            ) : null}
            <g transform={`translate(${s.x} ${s.y}) rotate(${s.rot} 0 -50)`} opacity={s.opacity}>
              <Bust
                skin={skinTones[n % skinTones.length]}
                cloth={outfitColors[(n * 3 + 1) % outfitColors.length]}
                expression={exprFor(t.r)}
                frame={frame}
                seed={n}
              />
            </g>
          </g>
        );
      })}

      {/* Coins */}
      {coins.map((c) => (
        <g key={c.key} transform={`translate(${c.x} ${c.y}) scale(${Math.max(0.25, Math.abs(c.spin))} 1)`}>
          <circle r={15} fill={colors.gold} stroke={shade(colors.gold, 0.3)} strokeWidth={3} />
          <circle r={7} fill="none" stroke={shade(colors.gold, 0.3)} strokeWidth={3} />
        </g>
      ))}
      {scatter.map((c) =>
        c ? (
          <g key={c.key} transform={`translate(${c.x} ${c.y})`}>
            <circle r={14} fill={colors.gold} stroke={shade(colors.gold, 0.3)} strokeWidth={3} />
          </g>
        ) : null,
      )}
    </svg>
  );
};
