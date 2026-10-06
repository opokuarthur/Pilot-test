// Video: the main composition. Scenes play back-to-back inside a
// TransitionSeries with whip-pans between them; captions sit on top of
// everything on the global timeline; the last frames cut to black.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { Captions } from "./components/Captions";
import { whipPan, whipTiming } from "./components/WhipPan";
import { SCENE_COMPONENTS } from "./scenes";
import { SCENE_SECONDS, TOTAL_FRAMES, buildCaptions, sceneFrames } from "./config/timeline";
import { VIDEO } from "./config/video";
import { BLACK_TAIL } from "./scenes/Scene7RedFlags";
import { useTheme } from "./lib/theme-context";

const CAPTIONS = buildCaptions();

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const last = SCENE_SECONDS.length - 1;
  const items: React.ReactNode[] = [];
  SCENE_SECONDS.forEach(({ id }, i) => {
    const Scene = SCENE_COMPONENTS[id];
    // Extend every scene but the last by the whip length so scene starts stay on the script timings.
    items.push(
      <TransitionSeries.Sequence key={id} durationInFrames={sceneFrames(id) + (i < last ? VIDEO.whipFrames : 0)}>
        <Scene />
      </TransitionSeries.Sequence>,
    );
    if (i < last) {
      items.push(
        <TransitionSeries.Transition
          key={`${id}-whip`}
          presentation={whipPan({ direction: i % 2 ? "right" : "left", streakColor: colors.cream })}
          timing={whipTiming(VIDEO.whipFrames)}
        />,
      );
    }
  });
  return (
    <AbsoluteFill style={{ background: colors.navy }}>
      <TransitionSeries>{items}</TransitionSeries>
      <Captions chunks={CAPTIONS} />
      {frame >= TOTAL_FRAMES - BLACK_TAIL ? <AbsoluteFill style={{ background: "#000" }} /> : null}
    </AbsoluteFill>
  );
};
