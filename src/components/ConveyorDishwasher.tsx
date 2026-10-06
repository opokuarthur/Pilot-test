// ConveyorDishwasher: an industrial rack-conveyor dishwasher, side view.
// Racks of dirty plates slide in from the left on rolling rollers, vanish
// through the curtain into the stainless tunnel, and roll out on the right
// clean, dripping and sparkling. Steam puffs from the hood; the panel LEDs
// blink. The belt is pre-filled so it's already running at frame 0.
// `racksOut()` tells a scene how many racks have come out (for counters).
import React from "react";
import { random, useCurrentFrame } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type ConveyorDishwasherProps = ThemableProps & {
  /** Rendered width in px (height = 0.7 × width). */
  width?: number;
  /** Belt speed in viewBox units (1000 wide) per frame. */
  speed?: number;
  /** Frames between racks. */
  rackEvery?: number;
  platesPerRack?: number;
  steelColor?: string;
};

const VB = { w: 1000, h: 700 };
const BELT_Y = 470;
const RACK_W = 200;
const ENTRY = 330;
const EXIT = 670;
const START_X = -RACK_W - 40;

/**
 * Running index of racks that have come out of the machine by `frame`
 * (monotonic; the belt is pre-filled so it can be negative early on).
 * racksOut(b) - racksOut(a) = racks that came out between frames a and b.
 */
export const racksOut = (frame: number, speed = 4, rackEvery = 60) => {
  // Rack k spawns at k × rackEvery and is out once START_X + (frame - spawn) × speed > EXIT.
  const travel = (EXIT - START_X) / speed;
  return Math.floor((frame - travel) / rackEvery);
};

const Rack: React.FC<{ x: number; clean: boolean; seed: number; plates: number; steel: string; plate: string; rim: string; frame: number }> = ({
  x,
  clean,
  seed,
  plates,
  steel,
  plate,
  rim,
  frame,
}) => {
  const top = BELT_Y - 120;
  const step = (RACK_W - 50) / Math.max(1, plates - 1);
  return (
    <g transform={`translate(${x} 0)`}>
      {/* Plates standing in the rack, tilted so their faces show */}
      {Array.from({ length: plates }, (_, i) => {
        const cx = 25 + i * step;
        const cy = top + 44;
        return (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={20} ry={50} fill={clean ? tint(plate, 0.2) : shade(plate, 0.18)} stroke={shade(plate, 0.35)} strokeWidth={2} />
            <ellipse cx={cx} cy={cy} rx={15} ry={42} fill="none" stroke={rim} strokeWidth={2.5} opacity={clean ? 1 : 0.6} />
            {!clean ? (
              <g fill="#7A4A26" opacity={0.85}>
                <ellipse cx={cx - 4 + random(`d${seed}${i}a`) * 8} cy={cy - 18 + random(`d${seed}${i}b`) * 30} rx={7} ry={9} />
                <ellipse cx={cx + 3} cy={cy + 14 + random(`d${seed}${i}c`) * 10} rx={4} ry={6} fill="#C0502A" />
              </g>
            ) : (
              <path d={`M${cx - 6} ${cy - 30} Q${cx - 10} ${cy} ${cx - 6} ${cy + 26}`} stroke="#fff" strokeWidth={4} opacity={0.75} fill="none" strokeLinecap="round" />
            )}
          </g>
        );
      })}
      {/* Wire basket */}
      <rect x={0} y={top + 40} width={RACK_W} height={80} rx={6} fill="none" stroke={steel} strokeWidth={6} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={i * (RACK_W / 8)} y1={top + 40} x2={i * (RACK_W / 8)} y2={top + 120} stroke={steel} strokeWidth={3} opacity={0.8} />
      ))}
      <line x1={0} x2={RACK_W} y1={top + 80} y2={top + 80} stroke={steel} strokeWidth={3} opacity={0.8} />
      {/* Drips + sparkles once clean */}
      {clean
        ? Array.from({ length: 4 }, (_, k) => {
            const ph = (frame * 3 + k * 23 + seed * 11) % 60;
            return <circle key={k} cx={30 + k * 48} cy={BELT_Y + ph * 0.8} r={4} fill="#9CC9F0" opacity={1 - ph / 60} />;
          })
        : null}
    </g>
  );
};

const Sparkle: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) =>
  s <= 0 ? null : (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -22 C3 -6 6 -3 22 0 C6 3 3 6 0 22 C-3 6 -6 3 -22 0 C-6 -3 -3 -6 0 -22 Z"
      fill={color}
    />
  );

export const ConveyorDishwasher: React.FC<ConveyorDishwasherProps> = ({
  width = 1000,
  speed = 4,
  rackEvery = 60,
  platesPerRack = 6,
  steelColor,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { colors, fonts } = useTheme(themable);
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const steel = steelColor ?? "#B8BEC8";
  const plate = colors.cream;
  const rim = "#3E6FB0";

  // Racks currently on the belt (pre-filled: spawns reach back before frame 0).
  const travelAll = (VB.w + 80 - START_X) / speed;
  const firstK = Math.floor((frame - travelAll) / rackEvery);
  const lastK = Math.floor(frame / rackEvery);
  const racks: { x: number; k: number }[] = [];
  for (let k = firstK; k <= lastK; k++) racks.push({ x: START_X + (frame - k * rackEvery) * speed, k });

  // Curtain sway when a rack passes the entry/exit.
  const near = (edge: number) => racks.some((r) => r.x < edge && r.x + RACK_W > edge);
  const curtain = (edge: number) => {
    const sw = near(edge) ? Math.sin(frame / 3) * 6 + 10 : Math.sin(frame / 10) * 2;
    return (
      <g>
        {Array.from({ length: 6 }, (_, i) => (
          <path
            key={i}
            d={`M${edge - 26 + i * 10} 344 Q${edge - 26 + i * 10 + sw * 0.5} 400 ${edge - 26 + i * 10 + sw} 462`}
            stroke={alpha("#CFE3F2", 0.75)}
            strokeWidth={9}
            fill="none"
          />
        ))}
      </g>
    );
  };

  const rollerOffset = (frame * speed) % 40;

  return (
    <svg width={width} height={width * 0.7} viewBox={`0 0 ${VB.w} ${VB.h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`steel${uid}`} x1="0" x2="1">
          <stop offset="0" stopColor={tint(steel, 0.35)} />
          <stop offset="0.45" stopColor={steel} />
          <stop offset="0.55" stopColor={tint(steel, 0.2)} />
          <stop offset="1" stopColor={shade(steel, 0.3)} />
        </linearGradient>
        <clipPath id={`belt${uid}`}>
          <rect x={-200} y={0} width={1400} height={VB.h} />
        </clipPath>
      </defs>
      {/* Belt frame + rollers */}
      <rect x={-200} y={BELT_Y} width={1400} height={18} fill={shade(steel, 0.35)} />
      <g clipPath={`url(#belt${uid})`}>
        {Array.from({ length: 38 }, (_, i) => {
          const x = -200 + i * 40 + rollerOffset;
          return (
            <g key={i}>
              <circle cx={x} cy={BELT_Y + 9} r={9} fill={shade(steel, 0.1)} />
              <line x1={x} y1={BELT_Y + 9} x2={x + Math.cos(frame * 0.4) * 8} y2={BELT_Y + 9 + Math.sin(frame * 0.4) * 8} stroke={shade(steel, 0.5)} strokeWidth={3} />
            </g>
          );
        })}
      </g>
      {[-120, 120, 880, 1120].map((x) => (
        <rect key={x} x={x} y={BELT_Y + 18} width={14} height={150} fill={shade(steel, 0.4)} />
      ))}
      {/* Racks (behind the machine body) */}
      {racks.map((r) => (
        <Rack key={r.k} x={r.x} clean={r.x + RACK_W / 2 > (ENTRY + EXIT) / 2} seed={r.k} plates={platesPerRack} steel={steel} plate={plate} rim={rim} frame={frame} />
      ))}
      {/* Machine body */}
      <rect x={ENTRY} y={150} width={EXIT - ENTRY} height={480} rx={14} fill={`url(#steel${uid})`} />
      <rect x={ENTRY} y={150} width={EXIT - ENTRY} height={480} rx={14} fill="none" stroke={shade(steel, 0.45)} strokeWidth={4} />
      {/* Hood + vent */}
      <path d={`M${ENTRY - 20} 160 L${ENTRY + 30} 100 H${EXIT - 30} L${EXIT + 20} 160 Z`} fill={shade(steel, 0.12)} />
      <rect x={460} y={70} width={80} height={34} rx={6} fill={shade(steel, 0.35)} />
      {/* Tunnel mouths */}
      <rect x={ENTRY - 4} y={338} width={30} height={130} fill={shade(colors.ink, 0.2)} />
      <rect x={EXIT - 26} y={338} width={30} height={130} fill={shade(colors.ink, 0.2)} />
      {curtain(ENTRY + 14)}
      {curtain(EXIT - 10)}
      {/* Door seams + panel */}
      <line x1={500} x2={500} y1={190} y2={600} stroke={shade(steel, 0.35)} strokeWidth={3} />
      <rect x={390} y={196} width={220} height={110} rx={10} fill={colors.ink} />
      <text x={500} y={236} textAnchor="middle" fontFamily={fonts.body} fontWeight={800} fontSize={19} fill={tint(colors.gold, 0.1)} letterSpacing={1.5}>
        WASH · RINSE · DRY
      </text>
      {[0, 1, 2, 3, 4].map((i) => {
        const on = Math.floor(frame / 8 + i) % 5 !== 0;
        return <circle key={i} cx={430 + i * 35} cy={276} r={9} fill={on ? colors.up : shade(colors.up, 0.6)} />;
      })}
      <rect x={410} y={520} width={180} height={18} rx={9} fill={shade(steel, 0.35)} />
      {/* Legs */}
      {[ENTRY + 20, EXIT - 40].map((x) => (
        <rect key={x} x={x} y={628} width={20} height={44} fill={shade(steel, 0.45)} />
      ))}
      {/* Steam */}
      {Array.from({ length: 6 }, (_, k) => {
        const ph = ((frame + k * 17) % 100) / 100;
        return (
          <circle
            key={k}
            cx={500 + Math.sin(k * 2.1 + frame / 20) * 30 + (k - 2.5) * 10}
            cy={70 - ph * 140}
            r={22 + ph * 40}
            fill={colors.cream}
            opacity={(1 - ph) * 0.35}
          />
        );
      })}
      {/* Sparkles over freshly cleaned racks */}
      {racks
        .filter((r) => r.x > EXIT - 60 && r.x < VB.w)
        .flatMap((r) =>
          [0, 1, 2].map((k) => {
            const tw = Math.sin((frame + k * 9 + r.k * 13) / 5);
            return <Sparkle key={`${r.k}-${k}`} x={r.x + 30 + k * 70} y={BELT_Y - 150 + ((k * 37 + r.k * 19) % 60)} s={Math.max(0, tw) * 1.1} color={k % 2 ? colors.gold : "#FFFFFF"} />;
          }),
        )}
    </svg>
  );
};
