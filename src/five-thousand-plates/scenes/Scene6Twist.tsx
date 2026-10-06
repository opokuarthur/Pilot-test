// Scene 6 — The twist (1:50–2:10).
// An industrial conveyor dishwasher runs the whole scene: dirty racks in,
// clean sparkling racks out. "NOT A SINK. A MACHINE." → "NOT SCRUBBING." →
// "KEEP IT FED."
import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { ConveyorDishwasher } from "../../components/ConveyorDishwasher";
import { TextSlam } from "../../components/TextSlam";
import { alpha } from "../../lib/color";
import { useTheme } from "../../lib/theme-context";
import { platesPushFrames } from "../timeline";

const TITLES_EXIT = 374;
const SCRUB = 384;
const FED = 492;

export const Scene6Twist: React.FC = () => {
  const { colors } = useTheme();
  return (
    <SceneFrame pushDuration={platesPushFrames("twist")} background={`linear-gradient(${colors.navy}, #1B2A4C)`}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 62%, ${alpha("#9CC9F0", 0.12)} 0%, transparent 50%)` }} />
      {/* Kitchen floor */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, bottom: 0, background: alpha(colors.ink, 0.45) }} />
      <div style={{ position: "absolute", left: 0, top: 440 }}>
        <ConveyorDishwasher width={1080} speed={5} rackEvery={50} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 190, display: "flex", justifyContent: "center" }}>
        <TextSlam text="NOT A SINK." at={40} exitAt={TITLES_EXIT} fontSize={120} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 320, display: "flex", justifyContent: "center" }}>
        <TextSlam text="A MACHINE." at={150} exitAt={TITLES_EXIT} fontSize={120} color={colors.navy} plate={colors.gold} rotate={-2} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center" }}>
        <TextSlam text="NOT SCRUBBING." at={SCRUB} exitAt={FED - 8} fontSize={116} color={colors.cream} plate={colors.red} rotate={2} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center" }}>
        <TextSlam text={"KEEP THE\nMACHINE FED"} at={FED} fontSize={116} color={colors.navy} plate={colors.gold} rotate={-2} />
      </div>
    </SceneFrame>
  );
};
