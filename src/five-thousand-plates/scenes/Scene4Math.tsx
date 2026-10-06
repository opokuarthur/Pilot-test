// Scene 4 — The math (0:55–1:25).
// A big stopwatch runs; every 6 stopwatch-seconds a plate slides in onto a
// pile, and the watch time-lapses faster and faster so the pile speeds up.
// MathWrite: "5,000 ÷ 8 hrs = 625 / hr" → "= 1 plate every 6 sec". NO BREAK /
// NO TOILET / NO PHONE. Then the watch resets for a 12-hour shift: a new pile,
// "12 hrs → 1 plate every 9 sec", and "TRY IT AT HOME".
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { Stopwatch, StopwatchRun, stopwatchEvents } from "../../components/Stopwatch";
import { MathWrite } from "../../components/MathWrite";
import { PlateStack } from "../../components/PlateStack";
import { TextSlam } from "../../components/TextSlam";
import { alpha } from "../../lib/color";
import { useTheme } from "../../lib/theme-context";
import { platesPushFrames } from "../timeline";

const RUN2 = 560; // 12-hour shift: watch resets, new pile
const MATH_EXIT = 548;
const CHIPS = 402;
const TRY_IT = 735;

const RUNS: StopwatchRun[] = [
  {
    at: 40,
    eventEvery: 6,
    speed: [
      { at: 0, value: 1 },
      { at: 200, value: 1 },
      { at: 330, value: 12 },
      { at: 480, value: 30 },
    ],
  },
  {
    at: RUN2,
    eventEvery: 9,
    speed: [
      { at: 0, value: 3 },
      { at: 90, value: 3 },
      { at: 180, value: 15 },
    ],
  },
];

const PILE = { x: 760, baseY: 1268, plateWidth: 300, thickness: 10, entry: "left" as const, travelFrames: 14, sway: 6 };

export const Scene4Math: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();
  // Plate landing frames = stopwatch event frames (computed over the whole scene once).
  const all = stopwatchEvents(RUNS, 900, fps);
  const land1 = all.filter((e) => e.run === 0).map((e) => e.frame + PILE.travelFrames);
  const land2 = all.filter((e) => e.run === 1).map((e) => e.frame + PILE.travelFrames - RUN2);
  // The first pile slides away when the watch resets.
  const pileOut = interpolate(frame, [RUN2 - 14, RUN2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });

  return (
    <SceneFrame pushDuration={platesPushFrames("math")}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 22%, ${alpha(colors.gold, 0.16)} 0%, transparent 45%)` }} />
      {/* Stopwatch */}
      <div style={{ position: "absolute", left: 540 - 230, top: 140 }}>
        <Stopwatch size={460} runs={RUNS} appearAt={4} />
      </div>
      {/* Plate piles */}
      {pileOut < 1 ? (
        <AbsoluteFill style={{ transform: `translateX(${pileOut * 700}px)` }}>
          <PlateStack {...PILE} landFrames={land1} count={land1.length} />
        </AbsoluteFill>
      ) : null}
      <Sequence from={RUN2} layout="none">
        <PlateStack {...PILE} landFrames={land2} count={land2.length} />
      </Sequence>
      {/* Lane hint: plates enter from the left */}
      <div style={{ position: "absolute", left: 100, right: 100, top: 1278, height: 6, borderRadius: 3, background: alpha(colors.cream, 0.15) }} />

      {/* Shift labels */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 730, display: "flex", justifyContent: "center" }}>
        <TextSlam text="8-HOUR SHIFT" at={54} exitAt={126} fontSize={96} color={colors.navy} plate={colors.gold} rotate={-2} />
      </div>
      {/* Equations */}
      <div style={{ position: "absolute", left: 100, top: 700 }}>
        <MathWrite
          width={880}
          fontSize={76}
          exitAt={MATH_EXIT}
          lines={[
            { text: "5,000 ÷ 8 hrs = *625 / hr*", at: 132 },
            { text: "= *1 plate every 6 sec*", at: 300, underline: true },
          ]}
        />
      </div>
      {/* No break / no toilet / no phone */}
      <div style={{ position: "absolute", left: 100, right: 100, top: 925, display: "flex", justifyContent: "space-between" }}>
        {["NO BREAK", "NO TOILET", "NO PHONE"].map((t, i) => (
          <TextSlam key={t} text={t} at={CHIPS + i * 12} exitAt={MATH_EXIT} fontSize={58} color={colors.cream} plate={colors.red} rotate={i === 1 ? 2 : -2} fromScale={1.8} />
        ))}
      </div>
      {/* 12-hour shift */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 925, display: "flex", justifyContent: "center" }}>
        <TextSlam text="12-HOUR SHIFT" at={RUN2} exitAt={TRY_IT - 10} fontSize={80} color={colors.navy} plate={colors.gold} rotate={2} />
      </div>
      <div style={{ position: "absolute", left: 100, top: 730 }}>
        <MathWrite width={880} fontSize={70} lines={[{ text: "12 hrs → *1 plate every 9 sec*", at: RUN2 + 72, underline: true }]} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 915, display: "flex", justifyContent: "center" }}>
        <TextSlam text="TRY IT AT HOME" at={TRY_IT} fontSize={96} color={colors.cream} plate={colors.red} rotate={-2} />
      </div>
    </SceneFrame>
  );
};
