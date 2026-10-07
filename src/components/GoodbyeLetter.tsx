// GoodbyeLetter: a tri-folded letter (crease lines, handwriting squiggles)
// with a big "GOODBYE" on it. It drops in with a small overshoot and
// flutter. At `pushAt` an open hand in a dark sleeve reaches in from the
// side, presses on the letter and pushes it away ("back" = into the
// distance, "left"/"right" = off the side), then withdraws.
import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, shade } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type GoodbyeLetterProps = ThemableProps & {
  width?: number;
  text?: string;
  appearAt?: number;
  /** Frame the hand starts reaching in (undefined = no push). */
  pushAt?: number;
  pushDirection?: "back" | "left" | "right";
  /** Hand enters from this side. */
  handFrom?: "right" | "left";
  skinTone?: string;
  sleeveColor?: string;
};

/** Open hand, palm toward the viewer, fingers up; local units, wrist at (0, 0). */
export const OpenHand: React.FC<{ skin: string; sleeve: string; cuff?: string }> = ({ skin, sleeve, cuff = "#F4EDE1" }) => {
  const dark = shade(skin, 0.18);
  return (
    <g>
      <rect x={-70} y={-4} width={140} height={420} rx={30} fill={sleeve} />
      <rect x={-70} y={-4} width={30} height={420} rx={14} fill="#fff" opacity={0.08} />
      <rect x={-74} y={-8} width={148} height={30} rx={12} fill={cuff} />
      <rect x={-60} y={-150} width={120} height={150} rx={46} fill={skin} />
      {[-42, -14, 14, 42].map((fx, i) => (
        <rect key={fx} x={fx - 13} y={-250 + Math.abs(i - 1.5) * 16} width={26} height={130} rx={13} fill={skin} />
      ))}
      <rect x={-104} y={-110} width={26} height={96} rx={13} fill={skin} transform="rotate(-35 -91 -62)" />
      <path d="M-30 -60 Q0 -40 30 -64" stroke={dark} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const GoodbyeLetter: React.FC<GoodbyeLetterProps> = ({
  width = 560,
  text = "GOODBYE",
  appearAt = 0,
  pushAt,
  pushDirection = "back",
  handFrom = "right",
  skinTone,
  sleeveColor,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts, skinTones } = useTheme(themable);
  if (frame < appearAt) return null;
  const W = width;
  const H = width * 1.18;
  const t = frame - appearAt;
  const inP = spring({ frame: t, fps, config: { damping: 10, mass: 0.7, stiffness: 120 } });
  const flutter = Math.sin(t / 14) * 2.2;

  // Hand: reach (0→1) over 14 frames, hold & push, withdraw.
  const pa = pushAt ?? 1e9;
  const reach = interpolate(frame, [pa, pa + 14, pa + 30, pa + 46], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const push = interpolate(frame, [pa + 12, pa + 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const hs = handFrom === "right" ? 1 : -1;

  let lx = 0;
  let ly = (1 - inP) * -700;
  let ls = 1;
  let lr = -4 + flutter + (1 - inP) * 20;
  let lo = 1;
  if (pushDirection === "back") {
    ls = 1 - push * 0.8;
    ly += -push * 260;
    lr += push * -16 * hs;
    lo = 1 - interpolate(push, [0.6, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  } else {
    const d = pushDirection === "left" ? -1 : 1;
    lx = d * push * 1100;
    lr += d * push * 30;
  }

  const creases = [H / 3, (2 * H) / 3];
  const skin = skinTone ?? skinTones[1];
  const sleeve = sleeveColor ?? "#2C3A5C";

  return (
    <div style={{ position: "relative", width: W, height: H }}>
      {lo > 0 ? (
        <div style={{ position: "absolute", inset: 0, transform: `translate(${lx}px, ${ly}px) scale(${ls}) rotate(${lr}deg)`, opacity: lo }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
            <rect x={10} y={16} width={W - 20} height={H - 20} rx={10} fill="#000" opacity={0.3} />
            <rect x={0} y={0} width={W} height={H} rx={10} fill={colors.cream} />
            {/* Fold panels shade differently */}
            <rect x={0} y={creases[0]} width={W} height={H / 3} fill={shade(colors.cream, 0.06)} />
            {creases.map((y) => (
              <g key={y}>
                <line x1={0} x2={W} y1={y} y2={y} stroke={shade(colors.cream, 0.25)} strokeWidth={3} />
                <line x1={0} x2={W} y1={y + 3} y2={y + 3} stroke="#fff" strokeWidth={2} opacity={0.6} />
              </g>
            ))}
            {/* Handwriting squiggles */}
            {Array.from({ length: 7 }, (_, k) => {
              const y = H * 0.48 + k * H * 0.064;
              const len = W * (k === 6 ? 0.4 : 0.72 - (k % 3) * 0.08);
              let d = `M${W * 0.12} ${y}`;
              for (let x = 0; x < len; x += 22) d += ` q 11 ${k % 2 ? -10 : -12} 22 0`;
              return <path key={k} d={d} stroke={alpha(colors.navy, 0.55)} strokeWidth={4} fill="none" strokeLinecap="round" />;
            })}
            {/* Signature */}
            <path d={`M${W * 0.56} ${H * 0.93} c 20 -40 40 20 60 -10 s 30 -30 50 0 s 30 10 50 -20`} stroke={colors.navy} strokeWidth={5} fill="none" strokeLinecap="round" />
            <text x={W / 2} y={H * 0.3} textAnchor="middle" fontFamily={fonts.headline} fontSize={W * 0.2} fill={colors.red} letterSpacing={3} transform={`rotate(-4 ${W / 2} ${H * 0.3})`}>
              {text}
            </text>
            <line x1={W * 0.18} x2={W * 0.82} y1={H * 0.34} y2={H * 0.32} stroke={colors.red} strokeWidth={6} strokeLinecap="round" />
          </svg>
        </div>
      ) : null}
      {reach > 0 ? (
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {/* Palm lands on the middle of the letter, arm angled in from the lower side. */}
          <g
            transform={`translate(${W / 2 + hs * (1 - reach) * W * 1.1 + hs * W * 0.18} ${H * 0.62 + (1 - reach) * H * 0.6 - push * 120}) rotate(${hs * -28}) scale(${0.95 - push * 0.15})`}
          >
            <OpenHand skin={skin} sleeve={sleeve} />
          </g>
        </svg>
      ) : null}
    </div>
  );
};
