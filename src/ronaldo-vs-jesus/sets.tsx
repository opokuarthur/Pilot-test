// Scene art for "Ronaldo vs Jesus": the plane cabin (Scene 2), the meeting
// room with three chairs (Scene 4) and the stadium → airport chase strip
// (Scene 5). All generic: no club, federation or airline marks.
import React from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { alpha, shade, tint } from "../lib/color";
import { useTheme } from "../lib/theme-context";
import { PersonFigure } from "../components/Person";
import { coachLook, playerLook } from "../components/Silhouettes";
import { PrivateJet } from "../components/PrivateJet";

const Full: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity }}>
    {children}
  </svg>
);

/** Night flight cabin: curved wall, two windows with clouds passing, overhead bins, seat backs. */
export const PlaneCabin: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const wall = "#1C2843";
  const win = (cx: number, cy: number, k: number) => (
    <g key={k}>
      <defs>
        <clipPath id={`cabWin${k}`}>
          <rect x={cx - 90} y={cy - 130} width={180} height={260} rx={86} />
        </clipPath>
      </defs>
      <rect x={cx - 112} y={cy - 152} width={224} height={304} rx={104} fill={tint(wall, 0.25)} />
      <rect x={cx - 90} y={cy - 130} width={180} height={260} rx={86} fill="#081022" />
      <g clipPath={`url(#cabWin${k})`}>
        <circle cx={cx + 40} cy={cy - 60} r={30} fill={alpha(colors.cream, 0.7)} />
        {Array.from({ length: 4 }, (_, j) => {
          const x = cx + 160 - ((frame * (3 + j) + j * 140 + k * 60) % 420);
          return <ellipse key={j} cx={x} cy={cy + 30 + j * 26} rx={90} ry={22} fill={alpha(colors.cream, 0.12 + j * 0.04)} />;
        })}
      </g>
      {/* Pulled-up shade */}
      <rect x={cx - 90} y={cy - 130} width={180} height={40} rx={20} fill={shade(colors.cream, 0.2)} />
    </g>
  );
  return (
    <Full opacity={opacity}>
      <defs>
        <linearGradient id="cabWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(wall, 0.3)} />
          <stop offset="0.5" stopColor={wall} />
          <stop offset="1" stopColor={shade(wall, 0.4)} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#cabWall)" />
      {/* Overhead bins */}
      <path d="M0 0 H1080 V170 Q540 240 0 170 Z" fill={tint(wall, 0.12)} />
      <path d="M0 170 Q540 240 1080 170" stroke={shade(wall, 0.4)} strokeWidth={8} fill="none" />
      {[180, 540, 900].map((x) => (
        <g key={x}>
          <circle cx={x} cy={196} r={10} fill={colors.gold} />
          <path d={`M${x - 14} 206 L${x - 160} 760 L${x + 160} 760 L${x + 14} 206 Z`} fill={alpha(colors.gold, 0.05)} />
        </g>
      ))}
      {win(170, 560, 0)}
      {win(910, 560, 1)}
      {/* Seat backs */}
      {[250, 830].map((x) => (
        <g key={x}>
          <rect x={x - 200} y={1120} width={400} height={500} rx={80} fill={shade("#3E6FB0", 0.45)} />
          <rect x={x - 150} y={1090} width={300} height={130} rx={50} fill={shade(colors.cream, 0.15)} />
          <rect x={x - 120} y={1300} width={240} height={150} rx={18} fill={shade("#3E6FB0", 0.6)} />
        </g>
      ))}
    </Full>
  );
};

/** Meeting room: window with blinds, a round table and three empty chairs. */
export const MeetingRoom: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const { colors } = useTheme();
  const wood = "#6B4426";
  const chair = (x: number, facing: 1 | -1, back: boolean, k: number) => (
    <g key={k} transform={`translate(${x} 0) scale(${facing} 1)`}>
      {back ? (
        <g>
          <rect x={-80} y={880} width={160} height={190} rx={24} fill={shade(wood, 0.25)} />
          <rect x={-66} y={894} width={132} height={160} rx={18} fill={shade(colors.red, 0.45)} />
        </g>
      ) : (
        <g>
          <rect x={-20} y={890} width={34} height={240} rx={10} fill={shade(wood, 0.2)} />
          <rect x={-20} y={890} width={90} height={150} rx={18} fill={shade(colors.red, 0.4)} transform="skewY(-6)" />
          <rect x={-30} y={1110} width={150} height={30} rx={10} fill={shade(colors.red, 0.3)} />
          <rect x={-24} y={1140} width={12} height={110} fill={shade(wood, 0.4)} />
          <rect x={98} y={1140} width={12} height={110} fill={shade(wood, 0.4)} />
        </g>
      )}
    </g>
  );
  return (
    <Full opacity={opacity}>
      <rect width={1080} height={1920} fill={shade(colors.navy, 0.05)} />
      {/* Window with blinds */}
      <rect x={300} y={330} width={480} height={420} rx={10} fill={tint(colors.navy, 0.1)} stroke={tint(colors.navy, 0.25)} strokeWidth={12} />
      {Array.from({ length: 12 }, (_, k) => (
        <rect key={k} x={306} y={340 + k * 34} width={468} height={18} fill={alpha(colors.gold, 0.16)} />
      ))}
      {/* Floor */}
      <rect x={0} y={1180} width={1080} height={740} fill={shade(colors.navy, 0.35)} />
      <ellipse cx={540} cy={1250} rx={420} ry={60} fill="#000" opacity={0.25} />
      {chair(540, 1, true, 0)}
      {chair(250, 1, false, 1)}
      {chair(830, -1, false, 2)}
      {/* Round table */}
      <rect x={520} y={1080} width={40} height={170} fill={shade(wood, 0.3)} />
      <ellipse cx={540} cy={1250} rx={120} ry={18} fill={shade(wood, 0.4)} />
      <ellipse cx={540} cy={1076} rx={250} ry={46} fill={shade(wood, 0.2)} />
      <ellipse cx={540} cy={1066} rx={250} ry={46} fill={wood} />
      <ellipse cx={500} cy={1060} rx={60} ry={12} fill={colors.cream} opacity={0.85} />
      <rect x={620} y={1036} width={18} height={30} rx={4} fill={alpha("#9CC9F0", 0.6)} />
    </Full>
  );
};

// ---- Stadium → airport chase ----------------------------------------------------

const WORLD = { w: 3300, ground: 1180 };

/** Generic stadium bowl with floodlight towers (world units). */
const Stadium: React.FC<{ x: number }> = ({ x }) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  return (
    <g transform={`translate(${x} 0)`}>
      {[60, 860].map((tx) => (
        <g key={tx}>
          <rect x={tx - 8} y={420} width={16} height={WORLD.ground - 420} fill={shade(colors.grey, 0.5)} />
          <rect x={tx - 70} y={380} width={140} height={60} rx={8} fill={shade(colors.grey, 0.4)} />
          {[0, 1, 2].map((c) => (
            <circle key={c} cx={tx - 44 + c * 44} cy={410} r={16} fill={colors.cream} opacity={0.8 + 0.2 * Math.sin(frame / 7 + c)} />
          ))}
          <path d={`M${tx - 70} 440 L${tx - 260} 900 L${tx + 260} 900 L${tx + 70} 440 Z`} fill={alpha(colors.cream, 0.05)} />
        </g>
      ))}
      <path d={`M60 ${WORLD.ground} L120 760 Q460 660 800 760 L860 ${WORLD.ground} Z`} fill={shade(colors.navy, 0.15)} />
      <path d="M120 760 Q460 660 800 760" stroke={colors.cream} strokeWidth={10} fill="none" opacity={0.5} />
      {Array.from({ length: 6 }, (_, k) => (
        <path key={k} d={`M${100 + k * 4} ${820 + k * 60} Q460 ${720 + k * 60} ${820 - k * 4} ${820 + k * 60}`} stroke={alpha(colors.cream, 0.12)} strokeWidth={6} fill="none" />
      ))}
      {/* Entrance */}
      <rect x={380} y={1030} width={160} height={150} rx={8} fill={alpha(colors.gold, 0.35)} />
    </g>
  );
};

/** Generic team coach (no lettering). */
const Bus: React.FC<{ x: number }> = ({ x }) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  return (
    <g transform={`translate(${x} ${WORLD.ground})`}>
      <rect x={0} y={-250} width={520} height={220} rx={30} fill={shade(colors.cream, 0.08)} />
      <rect x={0} y={-120} width={520} height={30} fill={colors.red} />
      <rect x={0} y={-90} width={520} height={14} fill={colors.gold} />
      {Array.from({ length: 6 }, (_, k) => (
        <rect key={k} x={24 + k * 74} y={-226} width={62} height={80} rx={8} fill={shade(colors.navy, 0.3)} />
      ))}
      <rect x={470} y={-226} width={42} height={120} rx={10} fill={shade(colors.navy, 0.3)} />
      {[100, 420].map((wx) => (
        <g key={wx} transform={`translate(${wx} -26) rotate(${frame * 6})`}>
          <circle r={36} fill="#0A0A0A" />
          <circle r={16} fill={shade(colors.grey, 0.2)} />
          <rect x={-3} y={-16} width={6} height={32} fill="#333" />
        </g>
      ))}
      <circle cx={512} cy={-60} r={10} fill={colors.gold} />
    </g>
  );
};

/** Airport: control tower, terminal, perimeter fence, "AIRPORT" sign (generic). */
const Airport: React.FC<{ x: number }> = ({ x }) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x={80} y={980} width={520} height={200} fill={shade(colors.navy, 0.2)} />
      {Array.from({ length: 8 }, (_, k) => (
        <rect key={k} x={100 + k * 62} y={1010} width={44} height={60} fill={alpha(colors.gold, 0.35)} />
      ))}
      <rect x={640} y={640} width={50} height={540} fill={shade(colors.navy, 0.1)} />
      <path d="M600 600 H730 L710 680 H620 Z" fill={tint(colors.navy, 0.15)} />
      <rect x={612} y={606} width={106} height={36} fill={alpha("#9CC9F0", 0.5)} />
      <circle cx={665} cy={580} r={8} fill={colors.red} opacity={frame % 30 < 15 ? 1 : 0.3} />
    </g>
  );
};

/** Road sign, generic. */
const Sign: React.FC<{ x: number; text: string }> = ({ x, text }) => {
  const { colors, fonts } = useTheme();
  return (
    <g transform={`translate(${x} ${WORLD.ground})`}>
      <rect x={-6} y={-300} width={12} height={300} fill={colors.grey} />
      <rect x={-150} y={-380} width={300} height={90} rx={12} fill="#2F7D5B" stroke={colors.cream} strokeWidth={5} />
      <text x={0} y={-320} textAnchor="middle" fontFamily={fonts.headline} fontSize={50} fill={colors.cream} letterSpacing={2}>
        {text}
      </text>
    </g>
  );
};

export type ChaseTimes = { busIn: number; busStop: number; exitBus: number; chase: number; board: number; rollAt: number; liftAt: number; goneAt: number };

/**
 * Side-scrolling chase: the team bus pulls up at the stadium, the #7 player
 * walks off (never trains), two suited silhouettes run after him, and he
 * boards the jet, which takes off. Camera follows the player.
 */
export const ChaseStrip: React.FC<{ t: ChaseTimes; appearAt: number }> = ({ t, appearAt }) => {
  const frame = useCurrentFrame();
  const { colors, fonts } = useTheme();
  if (frame < appearAt) return null;
  const busX = interpolate(frame, [t.busIn, t.busStop], [-700, 260], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const walk = Math.max(0, frame - t.exitBus);
  const playerX = 700 + walk * 8.4;
  const boarded = frame >= t.board;
  // Chasers run until the jet starts rolling, never quite catching up.
  const run = Math.max(0, Math.min(frame, t.rollAt) - t.chase);
  const playerAtStop = 700 + Math.max(0, Math.min(frame, t.rollAt) - t.exitBus) * 8.4;
  const chaserX = Math.min(playerAtStop - 400, 520 + run * 11);
  const stopped = frame >= t.rollAt;
  // Starts on the stadium, follows the player, then hands over to the jet.
  const jetX = 1580;
  const handover = interpolate(frame, [t.board, t.goneAt - 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const playerAtBoard = 700 + Math.max(0, t.board - t.exitBus) * 8.4;
  const focus = frame < t.board ? playerX - 700 : interpolate(handover, [0, 1], [playerAtBoard - 700, jetX + 1100 * 0.62 - 540]);
  const camX = Math.min(WORLD.w - 1080, Math.max(0, focus));
  const fade = interpolate(frame, [appearAt, appearAt + 8], [0, 1], { extrapolateRight: "clamp" });
  const s = 380 / 430; // person scale
  const fig = (x: number, props: Parameters<typeof PersonFigure>[0], key: string) => (
    <g key={key} transform={`translate(${x - 100 * s} ${WORLD.ground - 400 * s}) scale(${s})`}>
      <PersonFigure {...props} />
    </g>
  );

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity: fade }}>
      <defs>
        <linearGradient id="chaseSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050A17" />
          <stop offset="1" stopColor={colors.navy} />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#chaseSky)" />
      {Array.from({ length: 30 }, (_, k) => (
        <circle key={k} cx={(random(`cs${k}`) * 1400 - camX * 0.1 + 1400) % 1400 - 160} cy={random(`ct${k}`) * 600 + 150} r={2 + random(`cr${k}`) * 2} fill={colors.cream} opacity={0.4} />
      ))}
      <g transform={`translate(${-camX} 0)`}>
        {/* Ground + road */}
        <rect x={-200} y={WORLD.ground} width={WORLD.w + 400} height={800} fill={shade(colors.navy, 0.45)} />
        <rect x={-200} y={WORLD.ground} width={WORLD.w + 400} height={24} fill={alpha(colors.cream, 0.15)} />
        {Array.from({ length: 30 }, (_, k) => (
          <rect key={k} x={k * 110} y={WORLD.ground + 60} width={60} height={8} fill={alpha(colors.gold, 0.4)} />
        ))}
        <Stadium x={0} />
        <Sign x={1150} text="AIRPORT →" />
        <Airport x={1900} />
        {/* Jet on the apron, takes off to the right */}
        <g transform={`translate(${jetX} ${WORLD.ground - 0.74 * 700})`}>
          <PrivateJet width={1100} height={700} sky={false} runway={false} rollAt={t.rollAt} liftAt={t.liftAt} goneAt={t.goneAt} bank jetLength={520} />
        </g>
        <Bus x={busX} />
        {/* Chasers: coach + a second suited official */}
        {frame >= t.chase
          ? [0, 1].map((k) =>
              fig(
                chaserX - k * 140,
                {
                  ...coachLook(colors, k ? { rim: alpha(colors.gold, 0.7) } : {}),
                  walk: stopped ? 0 : 8,
                  pose: stopped ? "shrug" : "reach",
                  seed: k,
                },
                `ch${k}`,
              ),
            )
          : null}
        {/* The player */}
        {frame >= t.exitBus && !boarded ? fig(playerX, { ...playerLook(colors, fonts.headline), walk: 13 }, "pl") : null}
      </g>
    </svg>
  );
};
