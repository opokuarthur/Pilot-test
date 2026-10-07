// Scene 7 — Verdict (2:10–2:30).
// Split-screen poll wobbles: leans NO WAY on "by hand in a sink", swings to
// POSSIBLE on "machines, maybe", then wobbles. "POSSIBLE OR NO WAY?" slams on,
// then we end on the plate tower with "COMMENT BELOW 👇" and cut to black.
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { VerdictPoll } from "../../components/VerdictPoll";
import { PlateStack } from "../../components/PlateStack";
import { TextSlam } from "../../components/TextSlam";
import { alpha } from "../../lib/color";
import { useTheme } from "../../lib/theme-context";
import { platesFrames } from "../timeline";
import { HOOK_STACK } from "./Scene1Hook";

const QUESTION = 404;
const POLL_EXIT = 466;
const TOWER = 470;
const COMMENT = 500;
/** Frames from the end of the scene where we hard-cut to black. */
export const PLATES_BLACK_TAIL = 15;

export const Scene7Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const total = platesFrames("verdict");
  const dim = interpolate(frame, [QUESTION - 4, QUESTION + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <SceneFrame pushDuration={total}>
        <VerdictPoll
          appearAt={4}
          exitAt={POLL_EXIT}
          labelY={560}
          barY={1110}
          dim={dim}
          bias={[
            { at: 0, value: 50 },
            { at: 60, value: 24 },
            { at: 140, value: 24 },
            { at: 175, value: 70 },
            { at: 250, value: 70 },
            { at: 290, value: 50 },
          ]}
        />
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
          <TextSlam text={"POSSIBLE\nOR NO WAY?"} at={QUESTION} exitAt={POLL_EXIT} fontSize={150} color={colors.cream} plate={colors.ink} rotate={-2} />
        </div>
        {/* Ending: the tower again */}
        <Sequence from={TOWER} layout="none">
          <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, ${alpha(colors.gold, 0.25)} 0%, transparent 55%)` }} />
          <PlateStack {...HOOK_STACK} startAt={2} firstGap={8} count={400} />
        </Sequence>
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center" }}>
          <TextSlam text={"COMMENT\nBELOW 👇"} at={COMMENT} fontSize={150} color={colors.navy} plate={colors.gold} rotate={-3} />
        </div>
      </SceneFrame>
      {frame >= total - PLATES_BLACK_TAIL ? <AbsoluteFill style={{ background: "#000" }} /> : null}
    </AbsoluteFill>
  );
};
