// SceneSeries: plays scenes back-to-back inside a TransitionSeries with a
// whip-pan between each pair (alternating direction). Every scene but the
// last is extended by the whip length so scene starts stay on the script
// timings. Shared by every video in the project.
import React from "react";
import { TransitionSeries } from "@remotion/transitions";
import { whipPan, whipTiming } from "./WhipPan";
import { useTheme } from "../lib/theme-context";

export type SeriesScene = { id: string; frames: number; Component: React.FC };

export const SceneSeries: React.FC<{ scenes: SeriesScene[]; whipFrames: number; streakColor?: string }> = ({
  scenes,
  whipFrames,
  streakColor,
}) => {
  const { colors } = useTheme();
  const last = scenes.length - 1;
  const items: React.ReactNode[] = [];
  scenes.forEach(({ id, frames, Component }, i) => {
    items.push(
      <TransitionSeries.Sequence key={id} durationInFrames={frames + (i < last ? whipFrames : 0)}>
        <Component />
      </TransitionSeries.Sequence>,
    );
    if (i < last) {
      items.push(
        <TransitionSeries.Transition
          key={`${id}-whip`}
          presentation={whipPan({ direction: i % 2 ? "right" : "left", streakColor: streakColor ?? colors.cream })}
          timing={whipTiming(whipFrames)}
        />,
      );
    }
  });
  return <TransitionSeries>{items}</TransitionSeries>;
};
