// Scene 3 — The claim (0:35–0:55).
// Comment bubbles flood in ("5,000?? 😂", "Bro did the math", …) under a
// "5,000 PLATES A DAY" slam. Then the talk-show set rises and sweeps them
// away. On "on The Delay Show" the real interview frame slides in as a photo
// card over the set (if delay-interview.png is in public/), then "HE DOUBLED
// DOWN" lands on top; "NOT EXAGGERATED" / "CONSERVATIVE" swap in one slot
// above the card. The set's guests are solid silhouettes (no faces).
import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { CommentBubbles, floodComments } from "../../components/CommentBubbles";
import { TalkShowSet } from "../../components/TalkShowSet";
import { SlamAt, TextSlam } from "../../components/TextSlam";
import { alpha } from "../../lib/color";
import { useTheme } from "../../lib/theme-context";
import { platesPushFrames } from "../timeline";
import { PhotoCard } from "../../components/PhotoCard";
import { PHOTOS, hasPhoto } from "../credits";

const CLAIM_SLAM = 112;
const SWEEP = 284;
const SET_IN = 290;
const CARD_IN = 292; // "on The Delay Show" (9.6s)
const DOUBLED = 330;
const QUOTE_1 = 402;
const QUOTE_2 = 468;

const COMMENTS = floodComments(
  [
    "5,000?? 😂",
    "Bro did the math",
    "Impossible",
    "Make it make sense",
    "625 an hour?? 💀",
    "Calculator came out 🧮",
    "No way 😭",
    "With a machine maybe 🤔",
    "Who was counting? 😂",
    "One plate every 6 secs?!",
    "I believe him 🙏",
    "Do the math!!",
  ],
  { start: 20, interval: 24, accel: 0.86, box: { left: 100, top: 380, width: 880, height: 900 }, rows: 9, fontSize: 44, seed: "claim" },
);

export const Scene3Claim: React.FC = () => {
  const { colors } = useTheme();
  const delayPhoto = hasPhoto(PHOTOS.delay.file);
  return (
    <SceneFrame pushDuration={platesPushFrames("claim")}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${alpha(colors.red, 0.12)} 0%, transparent 60%)` }} />
      <CommentBubbles items={COMMENTS} fontSize={44} sweepAt={SWEEP} sweepDirection="left" />
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, display: "flex", justifyContent: "center" }}>
        <TextSlam text="5,000 PLATES A DAY" at={CLAIM_SLAM} exitAt={SWEEP} fontSize={104} color={colors.navy} plate={colors.gold} rotate={-2} />
      </div>
      {/* Talk show */}
      <div style={{ position: "absolute", left: 50, top: 420 }}>
        <TalkShowSet width={980} appearAt={SET_IN} lightsOnAt={SET_IN + 10} talking={[{ side: "right", from: 380, to: 590 }]} />
      </div>
      {/* The real interview frame, over the set (stays to the end of the scene) */}
      {delayPhoto ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 500, height: 790, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PhotoCard src={staticFile(PHOTOS.delay.file)} maxWidth={740} maxHeight={560} rotate={-2.5} appearAt={CARD_IN} from="right" credit={PHOTOS.delay.credit} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, display: "flex", justifyContent: "center" }}>
        <TextSlam text="HE DOUBLED DOWN" at={delayPhoto ? DOUBLED : 300} fontSize={116} color={colors.cream} plate={colors.red} rotate={2} />
      </div>
      {/* Quote stickers: one slot between the title and the card */}
      <SlamAt y={delayPhoto ? 425 : 640} x={delayPhoto ? 540 : 500}>
        <TextSlam text="NOT EXAGGERATED" at={QUOTE_1} exitAt={delayPhoto ? QUOTE_2 - 6 : undefined} fontSize={66} color={colors.ink} plate={colors.cream} rotate={-3} fromScale={1.8} />
      </SlamAt>
      <SlamAt y={delayPhoto ? 425 : 750} x={540}>
        <TextSlam text="CONSERVATIVE" at={QUOTE_2} fontSize={66} color={colors.navy} plate={colors.gold} rotate={2} fromScale={1.8} />
      </SlamAt>
    </SceneFrame>
  );
};
