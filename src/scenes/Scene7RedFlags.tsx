// Scene 7 — Red flags + ending (2:15–2:40).
// Three red flags with "RUN" tags → "CHECK FIRST: SEC 0800 100 065" →
// a hand with the app: someone taps withdraw… Pending… cut to black.
import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { RedFlags } from "../components/RedFlags";
import { TextSlam } from "../components/TextSlam";
import { HandPhone } from "../components/HandPhone";
import { alpha } from "../lib/color";
import { useTheme } from "../lib/theme-context";
import { sceneFrames } from "../config/timeline";

const FLAGS_EXIT = 424;
const CHECK = 434;
const CHECK_EXIT = 552;
const PHONE_IN = 560;
/** Frames from the end of the scene where we hard-cut to black. */
export const BLACK_TAIL = 15;

export const Scene7RedFlags: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme();
  const total = sceneFrames("redFlags");
  const phoneIn = spring({ frame: frame - PHONE_IN, fps, config: { damping: 16, mass: 0.9 } });
  return (
    <AbsoluteFill>
      <SceneFrame pushDuration={total}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", justifyContent: "center" }}>
          <TextSlam text="RED FLAGS" at={6} exitAt={FLAGS_EXIT} fontSize={120} color={colors.red} />
        </div>
        <div style={{ position: "absolute", left: 100, top: 330 }}>
          <RedFlags
            width={850}
            rowHeight={285}
            fontSize={86}
            exitAt={FLAGS_EXIT}
            items={[
              { label: "GUARANTEED\nHIGH RETURNS", at: 66, tag: "RUN", tagAt: 160 },
              { label: "EARN BY\nRECRUITING", at: 196, tag: "RUN", tagAt: 290 },
              { label: "NOT SEC\nLICENSED", at: 316, tag: "RUN", tagAt: 404 },
            ]}
          />
        </div>

        {/* Check first */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center" }}>
          <TextSlam text="CHECK FIRST:" at={CHECK} exitAt={CHECK_EXIT} fontSize={150} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", justifyContent: "center" }}>
          <TextSlam text="SEC 0800 100 065" at={CHECK + 12} exitAt={CHECK_EXIT} fontSize={104} color={colors.navy} plate={colors.gold} rotate={-2} />
        </div>
        {frame >= CHECK + 30 && frame < CHECK_EXIT ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontFamily: fonts.body, fontWeight: 800, fontSize: 38, letterSpacing: 4, color: alpha(colors.cream, 0.75) }}>
            FREE LINE · CALL BEFORE YOU INVEST
          </div>
        ) : null}

        {/* Final phone */}
        <Sequence from={PHONE_IN} layout="none">
          <AbsoluteFill style={{ alignItems: "center", top: 170 + (1 - phoneIn) * 1200 }}>
            <HandPhone width={620} phone={{ balanceFrom: 2000, balanceTo: 2000, taps: [118] }} />
          </AbsoluteFill>
        </Sequence>
      </SceneFrame>
      {/* Hard cut to black */}
      {frame >= total - BLACK_TAIL ? <AbsoluteFill style={{ background: "#000" }} /> : null}
    </AbsoluteFill>
  );
};
