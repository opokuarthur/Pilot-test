// PrivateJet: a generic business jet (no livery, no logos) taking off at
// night. Side view: it rolls along a runway with chasing edge lights,
// rotates nose-up at `liftAt`, climbs and shrinks away. With `bank` it rolls
// into a turn and recedes into the distance with blinking nav lights.
//   <PrivateJet rollAt={60} liftAt={120} goneAt={220} />
// `sky={false}` / `runway={false}` drop the backdrop so the jet can sit on
// top of other scene art (e.g. an airport in a wider world).
import React from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type PrivateJetProps = ThemableProps & {
  width?: number;
  height?: number;
  /** Frame the jet starts rolling, lifts off, and is gone. */
  rollAt?: number;
  liftAt?: number;
  goneAt?: number;
  /** Bank into a turn and recede into the distance after lift-off. */
  bank?: boolean;
  /** Fly toward the right (default) or the left. */
  direction?: "right" | "left";
  /** Draw the night sky / the runway. */
  sky?: boolean;
  runway?: boolean;
  /** Runway surface line, as a fraction of the height. */
  groundY?: number;
  /** Jet length on the runway, in px. */
  jetLength?: number;
};

/** The jet in local units, facing right, nose at x≈360, wheels at y≈150. */
const Jet: React.FC<{ frame: number; gear: number; body: string; accent: string; glass: string; glow: number; colors: { red: string; up: string; gold: string } }> = ({
  frame,
  gear,
  body,
  accent,
  glass,
  glow,
  colors,
}) => {
  const strobe = frame % 36 < 3;
  const beacon = frame % 24 < 12;
  return (
    <g>
      {/* Engine glow / exhaust */}
      {glow > 0 ? (
        <g opacity={glow}>
          <ellipse cx={-330} cy={-2} rx={90} ry={22} fill={alpha(colors.gold, 0.35)} />
          <ellipse cx={-300} cy={-2} rx={40} ry={12} fill={alpha("#FFFFFF", 0.6)} />
        </g>
      ) : null}
      {/* Far wing */}
      <path d="M-40 26 L-150 -40 L-110 -40 L30 22 Z" fill={shade(body, 0.3)} />
      {/* Fuselage */}
      <path d="M-300 30 Q-330 0 -270 -14 L240 -24 Q330 -14 362 26 Q330 58 240 60 L-270 66 Q-310 62 -300 30 Z" fill={body} />
      <path d="M-280 46 L240 44 Q320 44 356 32 Q330 58 240 60 L-270 66 Q-300 62 -280 46 Z" fill={shade(body, 0.12)} />
      {/* Tail fin */}
      <path d="M-250 -8 L-330 -130 L-280 -130 L-180 -12 Z" fill={tint(body, 0.06)} />
      <path d="M-330 -130 L-280 -130 L-286 -118 L-322 -118 Z" fill={accent} />
      {/* Engine pod */}
      <rect x={-260} y={-30} width={110} height={34} rx={17} fill={shade(body, 0.08)} />
      <rect x={-262} y={-26} width={14} height={26} rx={6} fill={shade(body, 0.45)} />
      {/* Cheatline */}
      <rect x={-250} y={22} width={500} height={8} fill={accent} />
      {/* Windows (lit) */}
      {Array.from({ length: 7 }, (_, k) => (
        <ellipse key={k} cx={-130 + k * 46} cy={4} rx={11} ry={10} fill={glass} />
      ))}
      {/* Cockpit */}
      <path d="M262 -6 Q312 0 334 18 L280 18 Z" fill={shade(body, 0.55)} />
      {/* Near wing */}
      <path d="M-70 40 L-190 150 L-140 150 L40 44 Z" fill={shade(body, 0.16)} />
      {/* Landing gear */}
      {gear > 0.02 ? (
        <g transform={`translate(0 60) scale(1 ${gear}) translate(0 -60)`}>
          <rect x={-104} y={60} width={8} height={70} fill={shade(body, 0.5)} />
          <circle cx={-100} cy={136} r={16} fill="#0A0A0A" />
          <rect x={246} y={56} width={7} height={66} fill={shade(body, 0.5)} />
          <circle cx={250} cy={128} r={13} fill="#0A0A0A" />
        </g>
      ) : null}
      {/* Nav lights: red beacon on top, green wingtip, white strobe on the tail */}
      <circle cx={0} cy={-24} r={7} fill={colors.red} opacity={beacon ? 1 : 0.25} />
      {beacon ? <circle cx={0} cy={-24} r={22} fill={alpha(colors.red, 0.3)} /> : null}
      <circle cx={-188} cy={150} r={7} fill={colors.up} />
      <circle cx={-188} cy={150} r={20} fill={alpha(colors.up, 0.3)} />
      {strobe ? (
        <g>
          <circle cx={-326} cy={-128} r={9} fill="#FFFFFF" />
          <circle cx={-326} cy={-128} r={46} fill={alpha("#FFFFFF", 0.35)} />
        </g>
      ) : null}
      {/* Landing light while on the ground */}
      {gear > 0.5 ? <path d="M350 40 L760 0 L760 120 Z" fill={alpha("#FFF4D6", 0.12 * gear)} /> : null}
    </g>
  );
};

export const PrivateJet: React.FC<PrivateJetProps> = ({
  width = 1080,
  height = 1100,
  rollAt = 0,
  liftAt,
  goneAt,
  bank = false,
  direction = "right",
  sky = true,
  runway = true,
  groundY = 0.74,
  jetLength = 620,
  ...themable
}) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme(themable);
  const lift = liftAt ?? rollAt + 60;
  const gone = goneAt ?? lift + 90;
  const W = width;
  const H = height;
  const gy = H * groundY;
  const s = jetLength / 700;

  // Ground roll: accelerate from the left third to the lift point.
  const roll = interpolate(frame, [rollAt, lift], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const air = interpolate(frame, [lift, gone], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.sin) });
  const startX = W * 0.22;
  const liftX = W * 0.55;
  let x = startX + (liftX - startX) * roll;
  let y = gy - 150 * s;
  let rot = 0;
  let scale = 1;
  let squash = 1;
  if (bank) {
    // Climb out, then roll into a turn and shrink into the distance.
    const turn = interpolate(air, [0.25, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    x += air * W * 0.32 + turn * W * 0.05;
    y -= air * H * 0.55;
    rot = -14 * Math.min(1, air * 4) + turn * 6;
    scale = interpolate(air, [0, 1], [1, 0.12]);
    squash = 1 - 0.45 * turn;
  } else {
    x += air * W * 0.85;
    y -= air * air * H * 0.6 + air * H * 0.08;
    rot = -13 * Math.min(1, air * 5);
    scale = interpolate(air, [0, 1], [1, 0.45]);
  }
  const gear = interpolate(frame, [lift + 12, lift + 26], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = frame >= rollAt ? Math.min(1, (frame - rollAt) / 10) * (0.7 + 0.3 * Math.sin(frame / 2)) : 0.3;
  const visible = frame < gone + 4;
  const flip = direction === "left";
  // Lights chase toward the take-off direction.
  const chase = (frame - rollAt) * 0.5;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }}>
      {sky ? (
        <g>
          <defs>
            <linearGradient id="jetSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#050A17" />
              <stop offset="0.7" stopColor={colors.navy} />
              <stop offset="1" stopColor={shade(colors.navy, 0.2)} />
            </linearGradient>
          </defs>
          <rect x={-200} y={-400} width={W + 400} height={H + 400} fill="url(#jetSky)" />
          {Array.from({ length: 40 }, (_, k) => (
            <circle
              key={k}
              cx={random(`sx${k}`) * W}
              cy={random(`sy${k}`) * gy * 0.85 - 200}
              r={1.5 + random(`sr${k}`) * 2}
              fill={colors.cream}
              opacity={0.25 + 0.5 * Math.abs(Math.sin((frame + k * 17) / 25))}
            />
          ))}
          {/* Crescent moon */}
          <circle cx={W * 0.8} cy={H * 0.08} r={46} fill={tint(colors.cream, 0.2)} />
          <circle cx={W * 0.8 + 20} cy={H * 0.08 - 12} r={42} fill="#060C1B" />
          {/* Distant city lights on the horizon */}
          {Array.from({ length: 60 }, (_, k) => (
            <rect
              key={k}
              x={(k / 60) * W + random(`cl${k}`) * 10}
              y={gy - 120 - random(`ch${k}`) * 40}
              width={4}
              height={4}
              fill={k % 3 ? colors.gold : colors.cream}
              opacity={0.35 + 0.25 * Math.sin((frame + k * 9) / 14)}
            />
          ))}
        </g>
      ) : null}
      {runway ? (
        <g>
          {/* Grass + tarmac in slight perspective (narrower far edge) */}
          <rect x={-200} y={gy - 100} width={W + 400} height={H - gy + 500} fill="#0A1222" />
          <path d={`M-200 ${gy - 40} L${W + 200} ${gy - 60} L${W + 200} ${gy + 70} L-200 ${gy + 110} Z`} fill="#1A2236" />
          {/* Centre-line dashes */}
          {Array.from({ length: 14 }, (_, k) => {
            const xx = -100 + k * 100;
            const yy = gy + 35 - (xx / W) * 20;
            return <rect key={k} x={xx} y={yy} width={56} height={6} fill={alpha(colors.cream, 0.55)} />;
          })}
          {/* Edge lights with a chase toward the take-off direction */}
          {[0, 1].map((row) =>
            Array.from({ length: 24 }, (_, k) => {
              const xx = -60 + k * 50;
              const yy = row === 0 ? gy - 40 - (xx / W) * 20 : gy + 110 - (xx / W) * 40;
              const wave = (Math.sin((k - chase) * 0.6) + 1) / 2;
              const c = row === 0 ? colors.gold : colors.cream;
              return (
                <g key={`${row}-${k}`}>
                  <circle cx={xx} cy={yy} r={14} fill={alpha(c, 0.18 + 0.25 * wave)} />
                  <circle cx={xx} cy={yy} r={4.5} fill={c} />
                </g>
              );
            }),
          )}
        </g>
      ) : null}
      {visible ? (
        <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * scale} ${s * scale * squash})`}>
          <Jet frame={frame} gear={gear} body={colors.cream} accent={colors.gold} glass={alpha(colors.gold, 0.9)} glow={glow} colors={colors} />
        </g>
      ) : null}
      {/* Wheel-spray streaks while rolling fast */}
      {roll > 0.3 && air === 0
        ? Array.from({ length: 5 }, (_, k) => (
            <rect key={k} x={x - 300 * s - k * 60} y={gy - 4 + k * 4} width={120 * roll} height={3} fill={alpha(colors.cream, 0.25)} />
          ))
        : null}
    </svg>
  );
};
