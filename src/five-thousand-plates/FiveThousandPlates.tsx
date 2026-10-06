// FiveThousandPlates: the main composition for the second video. Same
// structure as the first: scenes with whip-pans (SceneSeries), captions on
// the global timeline, and a hard cut to black at the very end.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Captions } from "../components/Captions";
import { SceneSeries } from "../components/SceneSeries";
import { VIDEO } from "../config/video";
import { useTheme } from "../lib/theme-context";
import { PLATES_SCENES, PLATES_TOTAL_FRAMES, platesFrames, platesTimeline } from "./timeline";
import { PLATES_SCENE_COMPONENTS } from "./scenes";
import { PLATES_BLACK_TAIL } from "./scenes/Scene7Verdict";

const CAPTIONS = platesTimeline.buildCaptions();
const SCENES = PLATES_SCENES.map(({ id }) => ({ id, frames: platesFrames(id), Component: PLATES_SCENE_COMPONENTS[id] }));

export const FiveThousandPlates: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  return (
    <AbsoluteFill style={{ background: colors.navy }}>
      <SceneSeries scenes={SCENES} whipFrames={VIDEO.whipFrames} />
      <Captions chunks={CAPTIONS} />
      {frame >= PLATES_TOTAL_FRAMES - PLATES_BLACK_TAIL ? <AbsoluteFill style={{ background: "#000" }} /> : null}
    </AbsoluteFill>
  );
};
