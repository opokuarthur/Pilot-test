// Scene art for the TimelineWalk stops in Scene 2. Each draws into an
// 880×760 box (bottom = ground). All generic: no real brands, logos or people.
// Key elements sit in the left ~half / upper part of each box: the right-hand
// lower area is where the RNAQ photo rises from behind the ground, looking left.
import React from "react";
import { random, useCurrentFrame } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { useTheme } from "../lib/theme-context";

const BOX = { w: 880, h: 760 };

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={BOX.w} height={BOX.h} viewBox={`0 0 ${BOX.w} ${BOX.h}`} style={{ overflow: "visible" }}>
    {children}
  </svg>
);

/** Jamestown: striped lighthouse, colourful coastal houses, a painted canoe and a drinks kiosk. */
export const JamestownStreet: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const beam = (frame % 90) / 90;
  const houses = [
    { x: 40, w: 170, h: 200, c: colors.gold },
    { x: 214, w: 150, h: 250, c: "#C8553D" },
    { x: 368, w: 180, h: 190, c: colors.cream },
    { x: 552, w: 140, h: 230, c: "#2F7D5B" },
    { x: 696, w: 160, h: 205, c: "#3E6FB0" },
  ];
  return (
    <Svg>
      {/* Sea */}
      <rect x={-120} y={430} width={1120} height={110} fill={shade("#3E6FB0", 0.25)} />
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M${-120 + ((frame * 1.2 + k * 60) % 120)} ${452 + k * 26} q30 -10 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0`} stroke={alpha(colors.cream, 0.25)} strokeWidth={4} fill="none" />
      ))}
      {/* Lighthouse */}
      <g transform="translate(430 0)">
        <path d="M-34 470 L-22 150 H22 L34 470 Z" fill={colors.cream} />
        {[190, 270, 350, 430].map((y) => (
          <path key={y} d={`M${-22 - (y - 150) * 0.0375} ${y} H${22 + (y - 150) * 0.0375} L${22 + (y + 40 - 150) * 0.0375} ${y + 40} H${-22 - (y + 40 - 150) * 0.0375} Z`} fill={colors.red} />
        ))}
        <rect x={-30} y={128} width={60} height={24} fill={colors.ink} />
        <rect x={-18} y={96} width={36} height={32} fill={tint(colors.gold, 0.3)} />
        <path d="M-24 96 L0 70 L24 96 Z" fill={colors.red} />
        <circle cx={0} cy={112} r={34 + Math.sin(beam * Math.PI * 2) * 6} fill={colors.gold} opacity={0.25} />
      </g>
      {/* Houses */}
      {houses.map((h, i) => (
        <g key={i}>
          <rect x={h.x} y={760 - h.h} width={h.w} height={h.h} fill={h.c} />
          <rect x={h.x} y={760 - h.h} width={h.w} height={h.h} fill="#000" opacity={0.08 + (i % 2) * 0.06} />
          <path d={`M${h.x - 10} ${760 - h.h} L${h.x + h.w / 2} ${760 - h.h - 40} L${h.x + h.w + 10} ${760 - h.h} Z`} fill={colors.grey} />
          <rect x={h.x + 22} y={760 - h.h + 34} width={40} height={46} fill={shade(h.c, 0.45)} />
          <rect x={h.x + h.w - 62} y={760 - h.h + 34} width={40} height={46} fill={shade(h.c, 0.45)} />
          <rect x={h.x + h.w / 2 - 24} y={760 - 96} width={48} height={96} fill={shade(h.c, 0.5)} />
        </g>
      ))}
      {/* Washing line */}
      <path d="M210 560 Q290 590 370 560" stroke={colors.ink} strokeWidth={3} fill="none" />
      {[240, 285, 330].map((x, i) => (
        <rect key={x} x={x} y={574 + (i === 1 ? 6 : 0)} width={30} height={40} fill={[colors.red, colors.gold, colors.cream][i]} />
      ))}
      {/* Painted fishing canoe with flags */}
      <g transform="translate(330 704) scale(0.82)">
        <path d="M-200 0 Q0 60 200 0 L170 40 Q0 80 -170 40 Z" fill="#2F7D5B" />
        <path d="M-185 12 Q0 66 185 12" stroke={colors.gold} strokeWidth={8} fill="none" />
        <path d="M-175 26 Q0 76 175 26" stroke={colors.red} strokeWidth={6} fill="none" />
        <line x1={-150} y1={0} x2={-150} y2={-90} stroke={colors.ink} strokeWidth={5} />
        <rect x={-150} y={-90} width={50} height={30} fill={colors.red} />
        <line x1={150} y1={0} x2={150} y2={-80} stroke={colors.ink} strokeWidth={5} />
        <rect x={150} y={-80} width={44} height={26} fill={colors.gold} />
      </g>
      {/* Drinks kiosk with unlabelled bottles */}
      <g transform="translate(40 560)">
        <rect x={0} y={0} width={160} height={200} fill="#6B3E1F" />
        <path d="M-14 0 H174 L160 -36 H0 Z" fill={colors.red} />
        <rect x={12} y={20} width={136} height={80} fill={shade("#6B3E1F", 0.4)} />
        {[0, 1, 2, 3, 4].map((k) => (
          <g key={k} transform={`translate(${26 + k * 26} 36)`}>
            <rect x={-7} y={18} width={14} height={40} rx={4} fill={alpha(tint(colors.gold, 0.4), 0.85)} />
            <rect x={-3} y={4} width={6} height={16} fill={alpha(tint(colors.gold, 0.4), 0.85)} />
          </g>
        ))}
        <rect x={0} y={106} width={160} height={12} fill={shade("#6B3E1F", 0.25)} />
      </g>
    </Svg>
  );
};

/** A kitchen abroad: tiled wall, steel sink with steam, a pile of plates, rainy window. */
export const KitchenSink: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const steel = "#B8BEC8";
  return (
    <Svg>
      {/* Tiles */}
      <clipPath id="tilesClip">
        <rect x={0} y={60} width={880} height={700} />
      </clipPath>
      <rect x={0} y={60} width={880} height={700} fill={tint(colors.cream, 0.1)} />
      <g clipPath="url(#tilesClip)">
      {Array.from({ length: 12 }, (_, r) =>
        Array.from({ length: 13 }, (_, c) => <rect key={`${r}-${c}`} x={c * 74 + (r % 2) * 37 - 37} y={60 + r * 58} width={70} height={54} fill={shade(colors.cream, 0.06 + ((r + c) % 3) * 0.015)} />),
      )}
      </g>
      {/* Rainy window (abroad) */}
      <rect x={520} y={110} width={290} height={220} rx={8} fill={colors.ink} />
      <rect x={532} y={122} width={266} height={196} fill="#5C6B80" />
      {Array.from({ length: 14 }, (_, k) => {
        const y = ((frame * 14 + k * 53) % 220) + 110;
        const x = 540 + ((k * 37) % 250);
        return y < 318 ? <line key={k} x1={x} y1={y} x2={x - 6} y2={Math.min(318, y + 22)} stroke={alpha(colors.cream, 0.6)} strokeWidth={3} /> : null;
      })}
      <rect x={662} y={122} width={6} height={196} fill={colors.ink} />
      <rect x={532} y={216} width={266} height={6} fill={colors.ink} />
      {/* Counter + cabinet */}
      <rect x={0} y={520} width={880} height={240} fill={shade("#3E6FB0", 0.35)} />
      <rect x={-20} y={500} width={920} height={28} fill={steel} />
      {/* Sink basin + faucet */}
      <rect x={250} y={490} width={340} height={30} rx={8} fill={shade(steel, 0.35)} />
      <path d="M420 500 V340 Q420 300 460 300 H500 Q520 300 520 320 V340" stroke={tint(steel, 0.2)} strokeWidth={18} fill="none" strokeLinecap="round" />
      {/* Water stream */}
      <rect x={514} y={342} width={10} height={150} fill={alpha("#9CC9F0", 0.7)} />
      {/* Plates leaning in the sink + a pile beside */}
      {[0, 1, 2].map((k) => (
        <ellipse key={k} cx={330 + k * 36} cy={470} rx={22} ry={56} fill={colors.cream} stroke="#3E6FB0" strokeWidth={4} transform={`rotate(${-12 + k * 6} ${330 + k * 36} 470)`} />
      ))}
      <g>
        {Array.from({ length: 9 }, (_, k) => (
          <g key={k}>
            <rect x={24} y={488 - k * 15} width={180} height={14} rx={7} fill={shade(colors.cream, 0.05 + (k % 2) * 0.05)} />
            <rect x={34} y={490 - k * 15} width={160} height={2.5} fill="#3E6FB0" />
            {k % 3 === 0 ? <ellipse cx={84 + k * 9} cy={494 - k * 15} rx={10} ry={3} fill="#7A4A26" /> : null}
          </g>
        ))}
      </g>
      {/* Sponge */}
      <rect x={214} y={474} width={46} height={26} rx={6} fill={colors.gold} />
      <rect x={214} y={474} width={46} height={9} rx={4} fill={colors.up} />
      {/* Steam */}
      {Array.from({ length: 7 }, (_, k) => {
        const ph = ((frame + k * 15) % 105) / 105;
        return (
          <circle key={k} cx={360 + ((k * 47) % 200) + Math.sin(frame / 15 + k) * 18} cy={470 - ph * 300} r={20 + ph * 36} fill="#fff" opacity={(1 - ph) * 0.35} />
        );
      })}
    </Svg>
  );
};

/** Stacks of (generic) cash with coins and sparkles. */
export const CashStacks: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const note = "#4F9A6A";
  const stack = (x: number, n: number, key: string) => (
    <g key={key}>
      {Array.from({ length: n }, (_, k) => (
        <g key={k} transform={`translate(${x + (random(`${key}${k}`) - 0.5) * 8} ${740 - k * 26})`}>
          <rect x={0} y={-24} width={140} height={24} rx={3} fill={k % 2 ? note : shade(note, 0.1)} />
          <rect x={6} y={-20} width={128} height={16} rx={2} fill="none" stroke={tint(note, 0.35)} strokeWidth={2} />
          <rect x={57} y={-24} width={26} height={24} fill={colors.cream} opacity={0.85} />
        </g>
      ))}
    </g>
  );
  return (
    <Svg>
      <ellipse cx={240} cy={748} rx={240} ry={22} fill="#000" opacity={0.25} />
      {stack(14, 14, "a")}
      {stack(164, 22, "b")}
      {stack(314, 17, "c")}
      {/* Coins */}
      {Array.from({ length: 5 }, (_, k) => (
        <g key={k} transform={`translate(${40 + k * 92} ${742 - (k % 2) * 6})`}>
          <ellipse cx={0} cy={0} rx={30} ry={11} fill={shade(colors.gold, 0.3)} />
          <ellipse cx={0} cy={-6} rx={30} ry={11} fill={colors.gold} />
        </g>
      ))}
      {/* Sparkles */}
      {Array.from({ length: 8 }, (_, k) => {
        const s = Math.max(0, Math.sin((frame + k * 11) / 7));
        const x = 60 + ((k * 113) % 760);
        const y = 160 + ((k * 151) % 380);
        return <path key={k} transform={`translate(${x} ${y}) scale(${s * 1.3})`} d="M0 -22 C3 -6 6 -3 22 0 C6 3 3 6 0 22 C-3 6 -6 3 -22 0 C-6 -3 -3 -6 0 -22 Z" fill={k % 2 ? colors.gold : colors.cream} />;
      })}
    </Svg>
  );
};

/** A generic hypercar and a private jet, with party balloons and confetti. */
export const CarAndJet: React.FC<{ confettiAt?: number }> = ({ confettiAt = 0 }) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const body = "#2C4E8A";
  const conf = Math.max(0, frame - confettiAt);
  return (
    <Svg>
      {/* Tarmac line */}
      <rect x={-100} y={600} width={1080} height={8} fill={alpha(colors.cream, 0.2)} />
      {/* Jet */}
      <g transform="translate(420 300) scale(0.92)">
        <path d="M-330 40 Q-340 0 -280 -10 L240 -20 Q330 -10 360 30 Q330 60 240 62 L-280 70 Q-330 66 -330 40 Z" fill={colors.cream} />
        <path d="M-300 -6 L-360 -110 L-310 -110 L-220 -10 Z" fill={tint(colors.cream, 0.1)} />
        <path d="M-60 40 L-200 170 L-150 170 L40 44 Z" fill={shade(colors.cream, 0.12)} />
        <rect x={-260} y={24} width={500} height={10} fill={colors.gold} />
        {Array.from({ length: 8 }, (_, k) => (
          <ellipse key={k} cx={-180 + k * 50} cy={6} rx={12} ry={10} fill={shade(body, 0.2)} />
        ))}
        <path d="M290 0 Q320 6 336 24 L296 24 Z" fill={shade(body, 0.3)} />
        <rect x={-246} y={-10} width={56} height={30} rx={14} fill={tint(colors.grey, 0.3)} />
        {/* Landing gear */}
        <rect x={-200} y={66} width={8} height={196} fill={shade(colors.grey, 0.4)} />
        <circle cx={-196} cy={266} r={14} fill={colors.ink} />
      </g>
      {/* Hypercar (no badges) */}
      <g transform="translate(250 690) scale(0.72)">
        <ellipse cx={0} cy={66} rx={330} ry={16} fill="#000" opacity={0.35} />
        <path d="M-320 40 Q-330 0 -250 -16 Q-160 -80 -40 -84 Q80 -86 180 -30 Q300 -20 322 10 Q330 40 300 52 L-300 56 Z" fill={body} />
        <path d="M-120 -30 Q-80 -70 -10 -72 Q70 -70 120 -30 Z" fill={colors.ink} />
        <path d="M-60 -36 Q-40 -54 -10 -56" stroke={alpha(colors.cream, 0.6)} strokeWidth={5} fill="none" />
        <path d="M-40 -84 Q-90 -10 -40 52" stroke={shade(body, 0.45)} strokeWidth={10} fill="none" />
        <path d="M-320 40 Q-200 20 300 30" stroke={tint(body, 0.25)} strokeWidth={6} fill="none" />
        <rect x={290} y={6} width={30} height={10} rx={4} fill={colors.gold} />
        <rect x={-322} y={8} width={26} height={10} rx={4} fill={colors.red} />
        {[-200, 200].map((x) => (
          <g key={x}>
            <circle cx={x} cy={48} r={46} fill={colors.ink} />
            <circle cx={x} cy={48} r={26} fill={tint(colors.grey, 0.2)} />
            <g transform={`rotate(${frame * 2} ${x} 48)`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <line key={a} x1={x} y1={48} x2={x + Math.cos((a * Math.PI) / 180) * 24} y2={48 + Math.sin((a * Math.PI) / 180) * 24} stroke={shade(colors.grey, 0.3)} strokeWidth={5} />
              ))}
            </g>
          </g>
        ))}
      </g>
      {/* Balloons */}
      {[
        { x: 60, y: 140, c: colors.gold },
        { x: 120, y: 90, c: colors.red },
        { x: 780, y: 120, c: colors.gold },
        { x: 830, y: 180, c: colors.cream },
      ].map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y + Math.sin((frame + i * 20) / 18) * 10})`}>
          <path d="M0 50 Q8 120 -4 200" stroke={alpha(colors.cream, 0.6)} strokeWidth={2} fill="none" />
          <ellipse cx={0} cy={0} rx={36} ry={44} fill={b.c} />
          <ellipse cx={-12} cy={-14} rx={8} ry={12} fill="#fff" opacity={0.35} />
        </g>
      ))}
      {/* Confetti */}
      {conf > 0
        ? Array.from({ length: 40 }, (_, k) => {
            const x = ((k * 97) % 900) - 10 + Math.sin((conf + k * 7) / 9) * 20;
            const y = -60 + ((conf * (4 + (k % 5)) + k * 41) % 820);
            return <rect key={k} x={x} y={y} width={14} height={8} fill={[colors.gold, colors.red, colors.cream, colors.up][k % 4]} transform={`rotate(${conf * 8 + k * 30} ${x + 7} ${y + 4})`} />;
          })
        : null}
    </Svg>
  );
};
