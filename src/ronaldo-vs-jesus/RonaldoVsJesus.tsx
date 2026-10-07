// RonaldoVsJesus: the main composition for the third video. Same structure
// as the others: scenes with whip-pans (SceneSeries), captions on the global
// timeline, and a hard cut to black at the very end. Silent build: the
// captions carry the narration.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Captions } from "../components/Captions";
import { SceneSeries } from "../components/SceneSeries";
import { VIDEO } from "../config/video";
import { useTheme } from "../lib/theme-context";
import { RVJ_SCENES, RVJ_TOTAL_FRAMES, rvjFrames, rvjTimeline } from "./timeline";
import { RVJ_SCENE_COMPONENTS } from "./scenes";
import { RVJ_BLACK_TAIL } from "./scenes/Scene7Timing";

const CAPTIONS = rvjTimeline.buildCaptions();
const SCENES = RVJ_SCENES.map(({ id }) => ({ id, frames: rvjFrames(id), Component: RVJ_SCENE_COMPONENTS[id] }));

export const RonaldoVsJesus: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  return (
    <AbsoluteFill style={{ background: colors.navy }}>
      <SceneSeries scenes={SCENES} whipFrames={VIDEO.whipFrames} />
      <Captions chunks={CAPTIONS} />
      {frame >= RVJ_TOTAL_FRAMES - RVJ_BLACK_TAIL ? <AbsoluteFill style={{ background: "#000" }} /> : null}
    </AbsoluteFill>
  );
};
