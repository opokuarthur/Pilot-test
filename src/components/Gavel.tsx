// Gavel: a wooden gavel raised over its sound block. Before each slam it
// lifts a little (anticipation), then strikes fast, bounces, and the impact
// throws out a shock ring, speed lines and a shake. `gavelShake()` gives the
// same shake for shaking a whole scene.
//   <Gavel slamAt={[40, 70]} />
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type GavelProps = ThemableProps & {
  /** Rendered width; height = width × 0.8. */
  width?: number;
  slamAt: number | number[];
  appearAt?: number;
  exitAt?: number;
  /** Resting raised angle (degrees). */
  raised?: number;
  wood?: string;
};

const list = (v: number | number[]) => (Array.isArray(v) ? v : [v]);

/** Screen-shake offset (px) for impacts at `slamAt` (strike lands 6 frames after). */
export const gavelShake = (frame: number, slamAt: number | number[], amount = 18) => {
  let s = 0;
  for (const a of list(slamAt)) {
    const t = frame - (a + 6);
    if (t >= 0 && t < 16) s += Math.sin(t * 2.2) * amount * (1 - t / 16);
  }
  return s;
};

export const Gavel: React.FC<GavelProps> = ({ width = 640, slamAt, appearAt = 0, exitAt, raised = -48, wood = "#7A4A26", ...themable }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme(themable);
  if (frame < appearAt) return null;
  const W = width;
  const H = W * 0.8;
  const inP = spring({ frame: frame - appearAt, fps, config: { damping: 12, mass: 0.7 } });
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  if (out >= 1) return null;

  // Angle keyframes: rest → anticipate (lift more) → strike (0) → bounce → settle half-raised.
  const slams = list(slamAt).sort((a, b) => a - b);
  const pts: [number, number][] = [[-1e6, raised]];
  let rest = raised;
  for (const a of slams) {
    pts.push([a - 10, rest], [a, rest - 14], [a + 6, 0], [a + 10, raised * 0.14], [a + 14, 0], [a + 30, 0], [a + 48, raised * 0.5]);
    rest = raised * 0.5;
  }
  // Slams closer than ~50 frames apart cut the previous settle short.
  const clean: [number, number][] = [];
  for (const p of pts) if (!clean.length || p[0] > clean[clean.length - 1][0]) clean.push(p);
  const angle = interpolate(frame, clean.map((p) => p[0]), clean.map((p) => p[1]), { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const lastHit = slams.filter((a) => frame >= a + 6).map((a) => a + 6).pop() ?? -Infinity;
  const since = frame - lastHit;
  const impact = since >= 0 && since < 24 ? since / 24 : -1;
  const shake = gavelShake(frame, slams, 10);

  // Geometry: block centre at (0.42W, 0.82H); pivot (hand) at right.
  const block = { x: W * 0.42, y: H * 0.82 };
  const pivot = { x: W * 0.9, y: H * 0.62 };

  return (
    <div style={{ position: "relative", width: W, height: H, transform: `translate(${shake}px, ${(1 - inP) * 500 + out * 600}px)`, opacity: 1 - out }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        {/* Shadow */}
        <ellipse cx={block.x} cy={block.y + 54} rx={W * 0.28} ry={20} fill="#000" opacity={0.3} />
        {/* Sound block */}
        <ellipse cx={block.x} cy={block.y + 30} rx={W * 0.2} ry={34} fill={shade(wood, 0.35)} />
        <rect x={block.x - W * 0.2} y={block.y} width={W * 0.4} height={30} fill={shade(wood, 0.2)} />
        <ellipse cx={block.x} cy={block.y} rx={W * 0.2} ry={34} fill={tint(wood, 0.12)} />
        <ellipse cx={block.x} cy={block.y} rx={W * 0.13} ry={21} fill="none" stroke={shade(wood, 0.15)} strokeWidth={4} />
        {/* Impact: shock ring + speed lines */}
        {impact >= 0 ? (
          <g opacity={1 - impact}>
            <ellipse cx={block.x} cy={block.y - 6} rx={W * (0.22 + impact * 0.4)} ry={40 + impact * 60} fill="none" stroke={colors.cream} strokeWidth={10 * (1 - impact)} />
            {Array.from({ length: 8 }, (_, k) => {
              const a = Math.PI + (k / 7) * Math.PI;
              const r1 = W * 0.18 + impact * W * 0.12;
              const r2 = r1 + W * 0.08;
              return <line key={k} x1={block.x + Math.cos(a) * r1} y1={block.y - 30 + Math.sin(a) * r1 * 0.6} x2={block.x + Math.cos(a) * r2} y2={block.y - 30 + Math.sin(a) * r2 * 0.6} stroke={colors.gold} strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
        ) : null}
        {/* Gavel: handle from the pivot to the head; head lands on the block at angle 0 */}
        <g transform={`rotate(${angle} ${pivot.x} ${pivot.y})`}>
          {/* Handle */}
          <path d={`M${block.x + 30} ${block.y - 66} L${pivot.x + 30} ${pivot.y - 14} L${pivot.x + 34} ${pivot.y + 6} L${block.x + 30} ${block.y - 46} Z`} fill={tint(wood, 0.08)} />
          <ellipse cx={pivot.x + 34} cy={pivot.y - 4} rx={16} ry={14} fill={shade(wood, 0.1)} />
          {/* Head (a barrel, upright) */}
          <g transform={`translate(${block.x} ${block.y - 34 - 60}) rotate(-12)`}>
            <rect x={-56} y={-60} width={112} height={128} rx={18} fill={wood} />
            <rect x={-56} y={-60} width={30} height={128} rx={14} fill={tint(wood, 0.18)} />
            <rect x={-62} y={-48} width={124} height={16} rx={6} fill={colors.gold} />
            <rect x={-62} y={36} width={124} height={16} rx={6} fill={colors.gold} />
            <ellipse cx={0} cy={68} rx={56} ry={10} fill={shade(wood, 0.3)} />
          </g>
        </g>
      </svg>
    </div>
  );
};
