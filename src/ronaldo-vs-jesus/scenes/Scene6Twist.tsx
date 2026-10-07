// Scene 6 — The twist (2:00–2:20).
// "PLOT TWIST". On "He apologized" the Ronaldo cutout (applauding) returns
// briefly. On "punish him" the gavel slams: "PUNISH ME." / "NO REDUCTION".
// Then "NOT RETIRING" and the goal counter: 979 → "21 TO GO".
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { Gavel, gavelShake } from "../../components/Gavel";
import { Player } from "../../components/Silhouettes";
import { GoalProgress } from "../../components/GoalProgress";
import { TextSlam } from "../../components/TextSlam";
import { alpha } from "../../lib/color";
import { useTheme } from "../../lib/theme-context";
import { rvjPushFrames } from "../timeline";
import { PhotoMoment } from "../photos";

const ADMITS = 78; // "was wrong" (2.6 s)
const PHOTO = 148; // "He apologized" (5.0 s)
const PHOTO_OUT = 202;
const GAVEL = 196;
const SLAMS = [212, 266]; // "punish him" (7.0 s), "no reduction" (9.0 s)
const GAVEL_OUT = 344;
const NOT_RETIRING = 354; // (11.8 s)
const GOALS = 392;
const TO_GO = 510; // "21 goals away from 1,000" (17.0 s)

export const Scene6Twist: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const shake = gavelShake(frame, SLAMS, 16);
  return (
    <SceneFrame pushDuration={rvjPushFrames("twist")} background={`linear-gradient(${colors.navy}, #1B2A4C)`}>
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, ${alpha(colors.gold, 0.14)} 0%, transparent 55%)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center" }}>
          <TextSlam text="PLOT TWIST" at={8} exitAt={PHOTO - 4} fontSize={150} color={colors.gold} />
        </div>
        {/* The #7 silhouette, head down: owning it */}
        {frame < PHOTO ? (
          <div style={{ opacity: Math.min(1, frame / 8) * Math.max(0, Math.min(1, (PHOTO - frame) / 6)) }}>
            <Player x={540 - 205} y={1270} height={560} pose={[{ at: 0, value: "idle" }, { at: ADMITS, value: "cheeks" }]} />
          </div>
        ) : null}
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center" }}>
          <TextSlam text={"HE ADMITS\nIT WAS WRONG"} at={ADMITS} exitAt={PHOTO - 4} fontSize={110} color={colors.cream} plate={colors.ink} rotate={-2} />
        </div>
        {/* Brief photo return (no tag: he was introduced in Scene 1) */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center" }}>
          <PhotoMoment photo="ronaldo" appearAt={PHOTO} exitAt={PHOTO_OUT} width={430} from="left" rotate={-2.5} tag={false} />
        </div>
        <div style={{ position: "absolute", left: 540 - 400, top: 600 }}>
          <Gavel width={800} slamAt={SLAMS} appearAt={GAVEL} exitAt={GAVEL_OUT} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center" }}>
          <TextSlam text="PUNISH ME." at={SLAMS[0] + 6} exitAt={GAVEL_OUT} fontSize={170} color={colors.cream} plate={colors.red} rotate={-3} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center" }}>
          <TextSlam text="NO REDUCTION" at={SLAMS[1] + 6} exitAt={GAVEL_OUT} fontSize={90} color={colors.navy} plate={colors.gold} rotate={2} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center" }}>
          <TextSlam text="NOT RETIRING" at={NOT_RETIRING} fontSize={140} color={colors.navy} plate={colors.gold} rotate={-2} />
        </div>
        <div style={{ position: "absolute", left: 100, top: 440 }}>
          <GoalProgress appearAt={GOALS} value={979} target={1000} countFrom={900} countFrames={80} toGoAt={TO_GO} width={880} />
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
