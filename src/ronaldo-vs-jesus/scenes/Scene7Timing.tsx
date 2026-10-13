// Scene 7 — The timing (1:54–2:21). Beats follow the voiceover.
// Split screen: generic #10 shirt + "FAREWELL" (left), #7 shirt + phone whose
// "New post" notification lights up (right). Two calendars slam in showing
// the SAME circled day. A spotlight sits on the #10 side, then swings to the
// #7 side, dimming the #10 side. "COINCIDENCE?" (gold) / "OR POWER MOVE?"
// (red): always questions, never a claim. Then the poll: COINCIDENCE 🤷🏾 vs
// PLANNED 👀, wobbling; "TELL US 👇"; cut to black.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { ShirtSplit } from "../../components/ShirtSplit";
import { CalendarSlam } from "../../components/CalendarSlam";
import { Spotlight } from "../../components/Spotlight";
import { VerdictPoll } from "../../components/VerdictPoll";
import { TextSlam } from "../../components/TextSlam";
import { useTheme } from "../../lib/theme-context";
import { rvjFrames } from "../timeline";

const NOTIFY = 64; // "He promised the truth"
const CALENDARS = 152; // "exact same day"
const SPOT = 186; // "Messi said goodbye"
const FAREWELL = 204; // "goodbye"
const CAL_OUT = 350;
const COINCIDENCE = 358; // "Coincidence?"
const POWER = 392; // "Or did Ronaldo just steal the spotlight…"
const SWING = 430; // "steal the spotlight"
const SLAMS_OUT = 496;
const SPOT_OUT = 500; // "One legend chose his ending"
const NOT_DONE = 584; // "not done yet"
const SPLIT_OUT = 610;
const POLL = 620; // "So, who's right?"
const TELL = 708; // "Tell us in the comments"
/** Frames from the end of the scene where we hard-cut to black. */
export const RVJ_BLACK_TAIL = 15;

const Emoji: React.FC<{ e: string }> = ({ e }) => <div style={{ fontSize: 160, lineHeight: 1 }}>{e}</div>;

export const Scene7Timing: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const total = rvjFrames("timing");
  const dim = interpolate(frame, [TELL - 6, TELL + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <SceneFrame pushDuration={total}>
        <ShirtSplit appearAt={4} exitAt={SPLIT_OUT} shirtY={690} notifyAt={NOTIFY} leftBannerAt={FAREWELL} rightBanner="NOT DONE YET" rightBannerAt={NOT_DONE} />
        <div style={{ position: "absolute", left: 270 - 140, top: 150 }}>
          <CalendarSlam at={CALENDARS} exitAt={CAL_OUT} width={280} rotate={-3} />
        </div>
        <div style={{ position: "absolute", left: 810 - 140, top: 150 }}>
          <CalendarSlam at={CALENDARS + 8} exitAt={CAL_OUT} width={280} rotate={3} />
        </div>
        <Spotlight fromX={270} toX={810} appearAt={SPOT} swingAt={SWING} exitAt={SPOT_OUT} floorY={1250} beamWidth={520} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 190, display: "flex", justifyContent: "center" }}>
          <TextSlam text="COINCIDENCE?" at={COINCIDENCE} exitAt={SLAMS_OUT} fontSize={120} color={colors.gold} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center" }}>
          <TextSlam text="OR POWER MOVE?" at={POWER} exitAt={SLAMS_OUT} fontSize={104} color={colors.cream} plate={colors.red} rotate={-2} />
        </div>
        <VerdictPoll
          appearAt={POLL}
          leftLabel="COINCIDENCE"
          rightLabel="PLANNED"
          leftIcon={<Emoji e="🤷🏾" />}
          rightIcon={<Emoji e="👀" />}
          labelSize={86}
          leftColor={colors.gold}
          rightColor={colors.red}
          labelY={560}
          barY={1110}
          dim={dim}
          caption="WAS THE TIMING PLANNED?"
          bias={[
            { at: 0, value: 50 },
            { at: POLL + 40, value: 56 },
            { at: POLL + 80, value: 44 },
            { at: POLL + 120, value: 52 },
          ]}
        />
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
          <TextSlam text={"TELL US 👇"} at={TELL} fontSize={190} color={colors.navy} plate={colors.gold} rotate={-3} />
        </div>
      </SceneFrame>
      {frame >= total - RVJ_BLACK_TAIL ? <AbsoluteFill style={{ background: "#000" }} /> : null}
    </AbsoluteFill>
  );
};
