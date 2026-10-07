// Scene 3 — Norway (0:45–1:10).
// Team lunch: the coach taps the #7 player's shoulder, "30 minutes?" — "Yes."
// Then the match clock spins 45' → 90' (5' / 20' / 40' of warm-up land on
// the narration) while the #7 silhouette jogs and stretches on the touchline,
// never stepping on. Whistle at 90'. "PROMISE #1: BROKEN".
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { LunchTable } from "../../components/LunchTable";
import { WarmUpClock } from "../../components/WarmUpClock";
import { Sideline } from "../../components/Sideline";
import { TextSlam } from "../../components/TextSlam";
import { alpha } from "../../lib/color";
import { useTheme } from "../../lib/theme-context";
import { rvjPushFrames } from "../timeline";

const TAP = 66; // "the coach asks" (2.2 s)
const BUBBLE = 122; // "30 minutes?" (4.0 s)
const REPLY = 194; // "Ronaldo says yes" (6.4 s)
const LUNCH_OUT = 228;
const CLOCK = 238; // "warms up from half-time" (8.0 s)
const WHISTLE = 432; // "final whistle" (14.4 s)
const CLOCK_OUT = 486;
const BROKEN = 494; // "never steps on the pitch" (16.4 s)

export const Scene3Norway: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const lunchOut = interpolate(frame, [LUNCH_OUT, LUNCH_OUT + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const pitchDim = interpolate(frame, [WHISTLE, WHISTLE + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneFrame pushDuration={rvjPushFrames("norway")} background={`linear-gradient(${colors.navy}, #1B2A4C)`}>
      {/* Lunch */}
      {lunchOut < 1 ? (
        <AbsoluteFill style={{ transform: `translateX(${-lunchOut * 1100}px)` }}>
          <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${alpha(colors.gold, 0.12)} 0%, transparent 60%)` }} />
          <div style={{ position: "absolute", left: 90, top: 410 }}>
            <LunchTable width={900} seats={5} playerSeat={2} tapAt={TAP} bubbleAt={BUBBLE} replyText="Yes." replyAt={REPLY} freezeAt={BUBBLE} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 190, display: "flex", justifyContent: "center" }}>
            <TextSlam text="NORWAY" at={8} fontSize={150} color={colors.gold} />
          </div>
        </AbsoluteFill>
      ) : null}
      {/* Warm-up */}
      {frame >= CLOCK - 4 ? (
        <>
          <div style={{ position: "absolute", left: 0, top: 640 }}>
            <Sideline
              width={1080}
              height={520}
              playerHeight={360}
              appearAt={CLOCK - 4}
              pitchDim={pitchDim}
              action={[
                { at: 0, value: "jog" },
                { at: 330, value: "stretch" },
                { at: 380, value: "jog" },
                { at: WHISTLE + 4, value: "idle" },
              ]}
            />
          </div>
          <div style={{ position: "absolute", left: 540 - 240, top: 170 }}>
            <WarmUpClock
              size={480}
              appearAt={CLOCK}
              exitAt={CLOCK_OUT}
              whistleAt={WHISTLE}
              minutes={[
                { at: CLOCK, value: 45 },
                { at: 312, value: 50 },
                { at: 354, value: 65 },
                { at: 390, value: 85 },
                { at: 426, value: 90 },
              ]}
            />
          </div>
        </>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center" }}>
        <TextSlam text={"PROMISE #1:\nBROKEN"} at={BROKEN} fontSize={150} color={colors.cream} plate={colors.red} rotate={-2} />
      </div>
    </SceneFrame>
  );
};
