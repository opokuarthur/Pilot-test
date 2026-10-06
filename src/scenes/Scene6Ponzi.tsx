// Scene 6 — How it works (1:50–2:15). "PONZI SCHEME" slams in as a header,
// then the PyramidCollapse plays: build → money flows up → no new people →
// bottom row drops out → collapse. The header greys out with the collapse.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { ParallaxLayer } from "../components/KenBurns";
import { PyramidCollapse } from "../components/PyramidCollapse";
import { TextSlam } from "../components/TextSlam";
import { failFilter } from "../lib/motion";
import { alpha } from "../lib/color";
import { useTheme } from "../lib/theme-context";
import { sceneFrames } from "../config/timeline";
import { VIDEO } from "../config/video";

const T = { buildAt: 36, flowAt: 140, stallAt: 398, emptyAt: 520, collapseAt: 586 };

export const Scene6Ponzi: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const fail = interpolate(frame, [T.collapseAt, T.collapseAt + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneFrame pushDuration={sceneFrames("ponzi") + VIDEO.whipFrames}>
      <ParallaxLayer depth={0.6}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 30%, ${alpha(colors.gold, 0.14 * (1 - fail))}, transparent 55%)` }} />
      </ParallaxLayer>
      <ParallaxLayer depth={1.15}>
        <div style={{ position: "absolute", left: 90, top: 345 }}>
          <PyramidCollapse width={900} rowStagger={18} {...T} />
        </div>
      </ParallaxLayer>
      <div style={{ position: "absolute", left: 0, right: 0, top: 185, display: "flex", justifyContent: "center", filter: failFilter(fail) }}>
        <TextSlam text="PONZI SCHEME" at={6} fontSize={150} highlight={{ PONZI: colors.gold }} />
      </div>
    </SceneFrame>
  );
};
