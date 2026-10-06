// Video: the main composition. Scenes play back-to-back with whip-pans
// between them (SceneSeries); captions sit on top of everything on the
// global timeline; the last frames cut to black.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Captions } from "./components/Captions";
import { SceneSeries } from "./components/SceneSeries";
import { SCENE_COMPONENTS } from "./scenes";
import { SCENE_SECONDS, TOTAL_FRAMES, buildCaptions, sceneFrames } from "./config/timeline";
import { VIDEO } from "./config/video";
import { BLACK_TAIL } from "./scenes/Scene7RedFlags";
import { useTheme } from "./lib/theme-context";

const CAPTIONS = buildCaptions();
const SCENES = SCENE_SECONDS.map(({ id }) => ({ id, frames: sceneFrames(id), Component: SCENE_COMPONENTS[id] }));

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  return (
    <AbsoluteFill style={{ background: colors.navy }}>
      <SceneSeries scenes={SCENES} whipFrames={VIDEO.whipFrames} />
      <Captions chunks={CAPTIONS} />
      {frame >= TOTAL_FRAMES - BLACK_TAIL ? <AbsoluteFill style={{ background: "#000" }} /> : null}
    </AbsoluteFill>
  );
};
