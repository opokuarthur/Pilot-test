// Scene 5 — The press conference (1:35–2:00).
// Podium with microphones and camera flashes (coach as a silhouette only, no
// photo). The signed agreement hangs over the set and RIPS in half on
// "promise number two, broken"; "PROMISE #2: BROKEN" slams. Then the chase:
// the team bus pulls up at the stadium, the #7 silhouette walks off, two
// suited figures run after him toward the airport, and the jet takes off.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { Podium } from "../../components/Podium";
import { AgreementDoc } from "../../components/AgreementDoc";
import { TextSlam } from "../../components/TextSlam";
import { useTheme } from "../../lib/theme-context";
import { rvjPushFrames } from "../timeline";
import { ChaseStrip, ChaseTimes } from "../sets";

const DOC = 66; // "the opposite" (2.2 s)
const RIP = 380; // "promise number two, broken" (12.6 s)
const BROKEN = 394;
const PRESS_OUT = 452;
const CHASE: ChaseTimes = {
  busIn: 456, // "arrived at the stadium" (15.4 s)
  busStop: 500,
  exitBus: 518, // "never trained" (17.4 s)
  chase: 560, // "the coach and federation president" (18.8 s)
  board: 648,
  rollAt: 676,
  liftAt: 712,
  goneAt: 790,
};

export const Scene5Press: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const out = interpolate(frame, [PRESS_OUT, PRESS_OUT + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  return (
    <SceneFrame pushDuration={rvjPushFrames("press")}>
      {out < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - out }}>
          <div style={{ position: "absolute", left: 110, top: 200 }}>
            <Podium width={860} appearAt={0} flashFrom={6} flashTo={PRESS_OUT} flashRate={3} />
          </div>
          {/* The deal, hung over the set, then ripped */}
          <div style={{ position: "absolute", left: 640, top: 290 }}>
            <AgreementDoc width={320} appearAt={DOC} tickAt={[DOC, DOC, DOC, DOC, DOC, DOC, DOC, DOC]} approvedAt={DOC} ripAt={RIP} rotate={6} />
          </div>
        </AbsoluteFill>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center" }}>
        <TextSlam text={"PROMISE #2:\nBROKEN"} at={BROKEN} exitAt={PRESS_OUT} fontSize={150} color={colors.cream} plate={colors.red} rotate={2} />
      </div>
      <ChaseStrip t={CHASE} appearAt={CHASE.busIn - 4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center" }}>
        <TextSlam text="NEVER TRAINED" at={CHASE.exitBus + 6} exitAt={CHASE.chase + 30} fontSize={110} color={colors.gold} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center" }}>
        <TextSlam text="TO THE AIRPORT" at={CHASE.chase + 40} exitAt={CHASE.rollAt - 4} fontSize={110} color={colors.cream} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center" }}>
        <TextSlam text="WHEELS UP" at={CHASE.rollAt + 14} fontSize={120} color={colors.navy} plate={colors.gold} rotate={-2} />
      </div>
    </SceneFrame>
  );
};
