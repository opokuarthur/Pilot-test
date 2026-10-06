// Preview: HandPhone with count-up, three taps and a crack, plus a TextSlam.
import React from "react";
import { AbsoluteFill } from "remotion";
import { HandPhone } from "../components/HandPhone";
import { SceneFrame } from "../components/SceneFrame";
import { SlamAt, TextSlam } from "../components/TextSlam";

export const PhonePreview: React.FC = () => (
  <SceneFrame>
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 }}>
      <HandPhone
        width={620}
        phone={{ balanceFrom: 500, balanceTo: 2000, countAt: 10, countFrames: 60, taps: [90, 150, 200], crackAt: 240 }}
      />
    </AbsoluteFill>
    <SlamAt y={130}>
      <TextSlam text="99,858" count={{ from: 0, to: 99858, frames: 50 }} at={5} fontSize={120} />
    </SlamAt>
  </SceneFrame>
);
