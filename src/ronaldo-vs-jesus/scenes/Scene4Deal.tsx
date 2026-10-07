// Scene 4 — The deal (1:10–1:35).
// A room with three chairs round a table. The agreement slides in and its 8
// numbered points tick ✅ one by one up to "Eight points"; it's signed and
// stamped APPROVED ("8 POINTS. SIGNED OFF."). Then the doc lifts away and
// the two silhouettes hug in front of the table.
import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { AgreementDoc } from "../../components/AgreementDoc";
import { Coach, Player } from "../../components/Silhouettes";
import { TextSlam } from "../../components/TextSlam";
import { alpha } from "../../lib/color";
import { useTheme } from "../../lib/theme-context";
import { rvjPushFrames } from "../timeline";
import { MeetingRoom } from "../sets";

const DOC = 116; // "At his next press conference" (4.0 s)
const TICKS = [150, 196, 244, 290, 336, 380, 428, 474]; // last on "Eight points" (15.8 s)
const SIGN = 486;
const APPROVED = 510; // "Ronaldo approved it" (17.0 s)
const SIGNED_OFF = 478;
const DOC_OUT = 540;
const HUG = 552; // "They even hugged" (18.6 s)

const Hug: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();
  if (frame < HUG) return null;
  const p = spring({ frame: frame - HUG, fps, config: { damping: 13, mass: 0.8 } });
  const H = 500;
  const sway = Math.sin((frame - HUG) / 12) * 1.5 * p;
  // Bodies overlap so each "reach" arm wraps behind the other's back.
  const playerLeft = 540 - 270;
  const coachLeft = 540 - 100;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `rotate(${sway}deg)`, transformOrigin: "540px 1270px" }}>
      <Coach x={coachLeft + (1 - p) * 500} y={1270} height={H} pose="reach" flip rim={alpha(colors.gold, 0.85)} />
      <Player x={playerLeft - (1 - p) * 500} y={1270} height={H} pose="reach" />
    </div>
  );
};

export const Scene4Deal: React.FC = () => {
  const { colors } = useTheme();
  return (
    <SceneFrame pushDuration={rvjPushFrames("deal")}>
      <MeetingRoom />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${alpha(colors.gold, 0.12)} 0%, transparent 55%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center" }}>
        <TextSlam text="TWO DAYS LATER" at={6} exitAt={DOC - 6} fontSize={110} color={colors.gold} />
      </div>
      <div style={{ position: "absolute", left: 540 - 270, top: 450 }}>
        <AgreementDoc width={540} appearAt={DOC} exitAt={DOC_OUT} tickAt={TICKS} signAt={SIGN} approvedAt={APPROVED} rotate={-2} />
      </div>
      <Hug />
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", justifyContent: "center" }}>
        <TextSlam text={"8 POINTS.\nSIGNED OFF."} at={SIGNED_OFF} fontSize={104} color={colors.navy} plate={colors.gold} rotate={-2} />
      </div>
    </SceneFrame>
  );
};
