// AgreementDoc: a document with numbered lines (placeholder text bars) whose
// check boxes tick ✅ one by one, an optional signature that writes itself
// and an "APPROVED" stamp. At `ripAt` it tears in half down a jagged line:
// the halves strain apart, then fly off spinning while paper bits scatter.
//   <AgreementDoc tickAt={[30, 60, 90, …]} approvedAt={300} ripAt={420} />
import React from "react";
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";
import { TickBox } from "./Clipboard";

export type AgreementDocProps = ThemableProps & {
  width?: number;
  title?: string;
  /** Number of numbered lines. */
  lines?: number;
  /** Frame each line ticks (missing entries never tick). */
  tickAt?: number[];
  appearAt?: number;
  exitAt?: number;
  signAt?: number;
  approvedAt?: number;
  approvedText?: string;
  ripAt?: number;
  rotate?: number;
};

/** Jagged tear line from top to bottom, in % of the page. */
const tearPoints = (seed: string) => {
  const pts: [number, number][] = [];
  const n = 16;
  for (let i = 0; i <= n; i++) pts.push([50 + (random(`${seed}${i}`) - 0.5) * 9 + (i % 2 ? 2.5 : -2.5), (i / n) * 100]);
  return pts;
};

export const AgreementDoc: React.FC<AgreementDocProps> = ({
  width = 620,
  title = "AGREEMENT",
  lines = 8,
  tickAt = [],
  appearAt = 0,
  exitAt,
  signAt,
  approvedAt,
  approvedText = "APPROVED",
  ripAt,
  rotate = -2,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme(themable);
  if (frame < appearAt) return null;
  const W = width;
  const H = W * 1.34;
  const inP = spring({ frame: frame - appearAt, fps, config: { damping: 12, mass: 0.7, stiffness: 140 } });
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  if (out >= 1) return null;
  const bob = Math.sin((frame - appearAt) / 34) * 4;

  const rowTop = H * 0.2;
  const rowH = (H * 0.6) / lines;

  const page = (
    <div style={{ position: "absolute", inset: 0, borderRadius: W * 0.02, background: colors.cream, boxShadow: `0 24px 50px ${alpha("#000000", 0.4)}`, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ position: "absolute", left: W * 0.08, right: W * 0.08, top: H * 0.045, fontFamily: fonts.headline, fontSize: W * 0.11, lineHeight: 1, color: colors.navy, letterSpacing: 3, textAlign: "center" }}>{title}</div>
      <div style={{ position: "absolute", left: W * 0.08, right: W * 0.08, top: H * 0.14, height: 4, background: colors.navy }} />
      <div style={{ position: "absolute", left: W * 0.08, right: W * 0.08, top: H * 0.14 + 9, height: 2, background: colors.navy }} />
      {Array.from({ length: lines }, (_, i) => {
        const t = tickAt[i];
        const ticked = t !== undefined && frame >= t;
        const pop = ticked ? spring({ frame: frame - t, fps, config: { damping: 9, mass: 0.5, stiffness: 200 } }) : 0;
        const draw = t === undefined ? 0 : interpolate(frame, [t + 2, t + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const flash = t === undefined ? 0 : interpolate(frame, [t, t + 3, t + 18], [0, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const w1 = 0.5 + random(`ad${i}`) * 0.25;
        const w2 = 0.25 + random(`ae${i}`) * 0.3;
        return (
          <div key={i} style={{ position: "absolute", left: W * 0.06, right: W * 0.06, top: rowTop + i * rowH, height: rowH, display: "flex", alignItems: "center", gap: W * 0.03 }}>
            <div style={{ position: "absolute", inset: `${rowH * 0.06}px 0`, borderRadius: 8, background: alpha(colors.up, flash) }} />
            <div style={{ position: "relative", width: W * 0.08, fontFamily: fonts.headline, fontSize: rowH * 0.5, color: colors.navy, textAlign: "right" }}>{i + 1}.</div>
            <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", gap: rowH * 0.14 }}>
              <div style={{ width: `${w1 * 100}%`, height: rowH * 0.13, borderRadius: rowH, background: tint(colors.grey, 0.25) }} />
              <div style={{ width: `${w2 * 100}%`, height: rowH * 0.13, borderRadius: rowH, background: tint(colors.grey, 0.45) }} />
            </div>
            <div style={{ position: "relative", width: rowH * 0.62, height: rowH * 0.62, flex: "none", borderRadius: rowH * 0.12, border: `3px solid ${alpha(colors.grey, 0.7)}` }}>
              {ticked ? (
                <div style={{ position: "absolute", left: -5, top: -5 }}>
                  <TickBox size={rowH * 0.62 + 4} draw={draw} pop={pop} color={colors.up} />
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
      {/* Signature lines */}
      {[0.08, 0.54].map((l, k) => (
        <div key={l} style={{ position: "absolute", left: W * l, width: W * 0.38, top: H * 0.9, height: 3, background: alpha(colors.navy, 0.6) }}>
          {k === 0 && signAt !== undefined ? (
            <svg width={W * 0.38} height={H * 0.08} viewBox="0 0 200 50" style={{ position: "absolute", left: 0, bottom: 0, overflow: "visible" }}>
              <path
                d="M8 40 C 20 0, 34 0, 30 34 S 56 10, 70 30 S 90 44, 100 18 S 130 6, 128 34 S 160 40, 190 16"
                stroke={colors.navy}
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - interpolate(frame, [signAt, signAt + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
              />
            </svg>
          ) : null}
        </div>
      ))}
      {/* APPROVED stamp */}
      {approvedAt !== undefined && frame >= approvedAt ? (
        <div
          style={{
            position: "absolute",
            right: W * 0.06,
            top: H * 0.83,
            transform: `rotate(-14deg) scale(${interpolate(spring({ frame: frame - approvedAt, fps, config: { damping: 9, mass: 0.5, stiffness: 220 } }), [0, 1], [2.4, 1])})`,
            opacity: Math.min(1, (frame - approvedAt) / 3) * 0.9,
            border: `${W * 0.012}px solid ${colors.up}`,
            borderRadius: W * 0.02,
            padding: `${W * 0.008}px ${W * 0.03}px 0`,
            fontFamily: fonts.headline,
            fontSize: W * 0.09,
            letterSpacing: 4,
            color: colors.up,
            background: alpha(colors.cream, 0.6),
          }}
        >
          {approvedText}
        </div>
      ) : null}
    </div>
  );

  // ---- Rip -----------------------------------------------------------------
  const ra = ripAt ?? 1e9;
  const rip = frame >= ra;
  const strain = interpolate(frame, [ra, ra + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const fly = interpolate(frame, [ra + 8, ra + 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const pts = tearPoints("tear");
  const leftPoly = `polygon(0% 0%, ${pts.map(([x, y]) => `${x}% ${y}%`).join(", ")}, 0% 100%)`;
  const rightPoly = `polygon(100% 0%, ${pts.map(([x, y]) => `${x}% ${y}%`).join(", ")}, 100% 100%)`;
  const shake = rip && frame < ra + 8 ? Math.sin((frame - ra) * 3) * 6 : 0;

  const half = (side: -1 | 1) => (
    <div
      key={side}
      style={{
        position: "absolute",
        inset: 0,
        clipPath: side < 0 ? leftPoly : rightPoly,
        transformOrigin: `50% 100%`,
        transform: `translate(${side * (strain * 26 + fly * 760)}px, ${fly * fly * 500}px) rotate(${side * (strain * 7 + fly * 40)}deg)`,
      }}
    >
      {page}
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        transform: `translate(${shake}px, ${(1 - inP) * 900 + out * 900 + bob}px) rotate(${rotate + (1 - inP) * -8}deg)`,
      }}
    >
      {rip ? (
        <>
          {half(-1)}
          {half(1)}
          {/* Torn-edge fibres + paper bits */}
          {fly < 1
            ? Array.from({ length: 14 }, (_, k) => {
                const a = random(`pb${k}`) * Math.PI * 2;
                const d = (strain * 40 + fly * 420) * (0.4 + random(`pd${k}`));
                return (
                  <div
                    key={k}
                    style={{
                      position: "absolute",
                      left: W / 2 + Math.cos(a) * d - 8,
                      top: H * random(`py${k}`) + Math.sin(a) * d * 0.4 + fly * 300,
                      width: 14 + random(`pw${k}`) * 16,
                      height: 10 + random(`ph${k}`) * 10,
                      background: shade(colors.cream, 0.05),
                      transform: `rotate(${frame * 12 + k * 40}deg)`,
                      opacity: 1 - fly,
                    }}
                  />
                );
              })
            : null}
        </>
      ) : (
        page
      )}
    </div>
  );
};
