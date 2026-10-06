// Scene 4 — The list (1:05–1:15). StampGrid: 23 generic app icons get a
// "NOT LICENSED" stamp each, faster and faster; the counter lands on 23.
import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { StampGrid } from "../components/StampGrid";
import { alpha } from "../lib/color";
import { useTheme } from "../lib/theme-context";
import { sceneFrames } from "../config/timeline";
import { VIDEO } from "../config/video";

export const Scene4List: React.FC = () => {
  const { colors } = useTheme();
  return (
    <SceneFrame pushDuration={sceneFrames("list") + VIDEO.whipFrames}>
      {/* Faint blueprint grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${alpha(colors.cream, 0.04)} 2px, transparent 2px), linear-gradient(90deg, ${alpha(colors.cream, 0.04)} 2px, transparent 2px)`,
          backgroundSize: "90px 90px",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", top: 200 }}>
        <StampGrid count={23} cols={5} iconSize={140} gap={26} appearAt={4} stampStart={50} stampEnd={232} />
      </AbsoluteFill>
    </SceneFrame>
  );
};
