// Scene 2 — YepBit (0:15–0:40).
// Four friends cheer at their phones in a living room while a candlestick
// chart climbs on the wall TV. On the SEC warning everything freezes, goes
// grey, faces turn shocked, and "NOT LICENSED" slams on. Later a padlock
// lands on the chart: withdrawals frozen.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { ParallaxLayer } from "../components/KenBurns";
import { PersonFigure, PersonFigureProps } from "../components/Person";
import { TradingChart } from "../components/TradingChart";
import { TextSlam } from "../components/TextSlam";
import { failFilter, slam } from "../lib/motion";
import { mix, shade } from "../lib/color";
import { useTheme } from "../lib/theme-context";
import { CAST } from "../config/cast";
import { sceneFrames } from "../config/timeline";
import { VIDEO } from "../config/video";

const FREEZE = 372;
const SLAM = 378;
const LOCK = 612;

const Padlock: React.FC<{ color: string; body: string }> = ({ color, body }) => (
  <svg width={150} height={180} viewBox="0 0 150 180">
    <path d="M35 80 V55 a40 40 0 0 1 80 0 V80" stroke={color} strokeWidth={18} fill="none" />
    <rect x={10} y={75} width={130} height={100} rx={18} fill={body} />
    <circle cx={75} cy={118} r={13} fill={shade(body, 0.45)} />
    <rect x={69} y={122} width={12} height={28} rx={5} fill={shade(body, 0.45)} />
  </svg>
);

export const Scene2YepBit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();
  const fail = interpolate(frame, [FREEZE, FREEZE + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = interpolate(frame, [FREEZE, FREEZE + 2, FREEZE + 8], [0, 0.55, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const punch = 1 + 0.04 * interpolate(frame, [FREEZE, FREEZE + 6, FREEZE + 30], [0, 1, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lock = frame >= LOCK ? slam(frame, fps, LOCK) : 0;
  const frozen = frame >= FREEZE;

  const people: (PersonFigureProps & { x: number })[] = [
    { ...CAST.youngMan, x: 195 },
    { ...CAST.student, x: 415, accessory: "none" },
    { ...CAST.officeWorker, x: 665 },
    { ...CAST.churchAuntie, x: 885 },
  ];
  const screen = mix(colors.gold, colors.red, fail);

  return (
    <SceneFrame pushDuration={sceneFrames("yepbit") + VIDEO.whipFrames} background="#1E2E52">
      <AbsoluteFill style={{ filter: failFilter(fail), transform: `scale(${punch})` }}>
        {/* Room: wall, skirting, floor, sofa, lamp, plant */}
        <ParallaxLayer depth={0.7}>
          <AbsoluteFill style={{ background: "linear-gradient(#22345C, #1B2A4C)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1150, bottom: 0, background: "#151F38" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1142, height: 14, background: shade("#22345C", 0.35) }} />
          {/* Lamp */}
          <div style={{ position: "absolute", left: 990, top: 880, width: 8, height: 270, background: "#0E1528" }} />
          <div style={{ position: "absolute", left: 940, top: 820, width: 110, height: 80, background: colors.gold, clipPath: "polygon(20% 0, 80% 0, 100% 100%, 0 100%)", opacity: 0.85 }} />
          <div style={{ position: "absolute", left: 880, top: 880, width: 230, height: 300, background: `radial-gradient(ellipse at 50% 0%, ${colors.gold}33, transparent 70%)` }} />
          {/* Plant */}
          <div style={{ position: "absolute", left: 20, top: 1060, width: 70, height: 90, background: "#8C5A3C", borderRadius: "8px 8px 20px 20px" }} />
          {[-30, 0, 30].map((r) => (
            <div key={r} style={{ position: "absolute", left: 40, top: 930, width: 30, height: 150, background: "#2F7D5B", borderRadius: "50%", transform: `rotate(${r + Math.sin(frame / 40) * 2}deg)`, transformOrigin: "50% 100%" }} />
          ))}
          {/* Sofa */}
          <div style={{ position: "absolute", left: 120, right: 120, top: 980, height: 200, background: "#7A3E33", borderRadius: "50px 50px 18px 18px" }} />
          <div style={{ position: "absolute", left: 90, top: 1050, width: 90, height: 140, background: "#6A342B", borderRadius: 30 }} />
          <div style={{ position: "absolute", right: 90, top: 1050, width: 90, height: 140, background: "#6A342B", borderRadius: 30 }} />
        </ParallaxLayer>

        {/* Wall TV with the chart */}
        <ParallaxLayer depth={0.85}>
          <div style={{ position: "absolute", left: 90, top: 210, width: 900, height: 560, borderRadius: 34, background: "#07090F", padding: 20, boxSizing: "border-box", boxShadow: "0 30px 60px rgba(0,0,0,0.4)" }}>
            <TradingChart width={860} height={520} revealAt={20} revealFrames={330} freezeAt={FREEZE} />
          </div>
          <div style={{ position: "absolute", left: 500, top: 770, width: 80, height: 18, background: "#07090F" }} />
        </ParallaxLayer>

        {/* The friends */}
        <ParallaxLayer depth={1.25}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            {people.map(({ x, ...p }, i) => {
              const s = 1.08;
              return (
                <g key={i} transform={`translate(${x - 100 * s} ${1275 - 400 * s}) scale(${s})`}>
                  <PersonFigure
                    {...p}
                    seed={i * 2 + 1}
                    pose={[
                      { at: 0, value: i % 2 ? "cheer" : "phoneOne" },
                      { at: 60 + i * 20, value: i % 2 ? "phoneOne" : "cheer" },
                      { at: 160 + i * 15, value: i % 2 ? "cheer" : "phoneOne" },
                      { at: 260 + i * 10, value: "cheer" },
                      { at: FREEZE, value: "phone" },
                      { at: FREEZE + 140 + i * 12, value: i === 2 ? "cheeks" : "phone" },
                    ]}
                    expression={[
                      { at: 0, value: "happy" },
                      { at: 40 + i * 15, value: "excited" },
                      { at: FREEZE, value: "shocked" },
                      { at: FREEZE + 120 + i * 10, value: "worried" },
                    ]}
                    energy={frozen ? 0 : 0.55}
                    holdingPhone
                    phoneScreenColor={screen}
                  />
                </g>
              );
            })}
          </svg>
        </ParallaxLayer>
      </AbsoluteFill>

      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />

      {/* Slams stay in colour */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center" }}>
        <TextSlam text="NOT LICENSED" at={SLAM} fontSize={130} plate={colors.red} rotate={-6} />
      </div>
      {lock > 0 ? (
        <div style={{ position: "absolute", left: 465, top: 600, transform: `scale(${interpolate(lock, [0, 1], [2.5, 1])}) rotate(${8 + Math.sin(frame / 20) * 2}deg)` }}>
          <Padlock color={colors.cream} body={colors.red} />
        </div>
      ) : null}
    </SceneFrame>
  );
};
