// Scene 1 — Hook (0:00–0:12).
// A lone silhouette (from behind) next to one plate… then another… then the
// tower takes off: plates land faster and faster and the camera chases the
// top as it shoots up. A counter races 0 → 5,000, then "LET'S DO THE MATH".
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { PlateStack } from "../../components/PlateStack";
import { Person } from "../../components/Person";
import { TextSlam } from "../../components/TextSlam";
import { alpha } from "../../lib/color";
import { useTheme } from "../../lib/theme-context";
import { platesPushFrames } from "../timeline";

const COUNT_AT = 66;
const COUNT_FRAMES = 176;
const COUNT_EXIT = 248;
const MATH_AT = 256;

/** Shared tower look, reused by the ending of Scene 7. */
export const HOOK_STACK = {
  x: 600,
  baseY: 1230,
  plateWidth: 400,
  thickness: 18,
  count: 700,
  startAt: 14,
  firstGap: 33,
  accel: 0.8,
  minGap: 0.34,
  followY: 560,
} as const;

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const glow = interpolate(frame, [0, 120, 250], [0.12, 0.2, 0.32], { extrapolateRight: "clamp" });
  return (
    <SceneFrame pushDuration={platesPushFrames("hook")}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 56% 55%, ${alpha(colors.gold, glow)} 0%, transparent 55%)` }} />
      <PlateStack {...HOOK_STACK}>
        {({ cam }) => (
          // "One man": faceless silhouette from behind, standing by the stack.
          <Person
            x={130}
            y={HOOK_STACK.baseY + 6 + cam}
            height={330}
            view="back"
            silhouette={colors.ink}
            rimLight={alpha(colors.gold, 0.9)}
            hair="fade"
          />
        )}
      </PlateStack>
      {/* Counter racing 0 → 5,000 */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 210, display: "flex", justifyContent: "center" }}>
        <TextSlam
          at={COUNT_AT}
          exitAt={COUNT_EXIT}
          count={{ from: 0, to: 5000, frames: COUNT_FRAMES, easing: Easing.in(Easing.poly(4)) }}
          fontSize={210}
          color={colors.gold}
          plate={colors.ink}
          fromScale={1.6}
        />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center" }}>
        <TextSlam text="PLATES. ONE DAY." at={80} exitAt={COUNT_EXIT} fontSize={80} plate={colors.ink} shadow={null} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center" }}>
        <TextSlam text={"LET'S DO\nTHE MATH"} at={MATH_AT} fontSize={170} color={colors.navy} plate={colors.gold} rotate={-3} />
      </div>
    </SceneFrame>
  );
};
