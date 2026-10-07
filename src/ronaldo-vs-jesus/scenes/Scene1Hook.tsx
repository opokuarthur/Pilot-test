// Scene 1 — Hook (0:00–0:15).
// Night runway: the private jet rolls and takes off on "private jet". A
// generic "New post" notification slides in, "THE TRUTH" slams, then the
// Ronaldo cutout slides in with "CRISTIANO RONALDO — CAPTAIN".
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { PrivateJet } from "../../components/PrivateJet";
import { NotificationCard } from "../../components/NotificationCard";
import { TextSlam } from "../../components/TextSlam";
import { alpha } from "../../lib/color";
import { useTheme } from "../../lib/theme-context";
import { rvjPushFrames } from "../timeline";
import { PhotoMoment } from "../photos";

const ROLL = 70;
const LIFT = 168; // "private jet" (5.6 s)
const GONE = 290;
const NOTIFY = 292;
const TRUTH = 322;
const SWAP = 354; // notification + big slam leave
const PHOTO = 360; // "he did." (11.6 s) → photo

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const dim = interpolate(frame, [GONE - 20, GONE + 10], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneFrame pushDuration={rvjPushFrames("hook")} background="#050A17">
      <AbsoluteFill style={{ top: 120 }}>
        <PrivateJet width={1080} height={1500} rollAt={ROLL} liftAt={LIFT} goneAt={GONE} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: alpha(colors.ink, dim) }} />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${alpha(colors.gold, 0.14 * (dim * 2))} 0%, transparent 55%)` }} />
      {/* New post */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center" }}>
        <NotificationCard appearAt={NOTIFY} exitAt={SWAP} width={820} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
        <TextSlam text={"THE\nTRUTH"} at={TRUTH} exitAt={SWAP} fontSize={210} color={colors.gold} />
      </div>
      {/* Settles small at the top while the photo comes in */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 190, display: "flex", justifyContent: "center" }}>
        <TextSlam text="THE TRUTH" at={SWAP + 6} fontSize={110} color={colors.navy} plate={colors.gold} rotate={-2} fromScale={1.6} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 390, display: "flex", justifyContent: "center" }}>
        <PhotoMoment photo="ronaldo" appearAt={PHOTO} width={420} from="right" rotate={2.5} />
      </div>
    </SceneFrame>
  );
};
