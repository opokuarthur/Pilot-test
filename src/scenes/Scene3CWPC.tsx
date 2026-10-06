// Scene 3 — CWPC (0:40–1:05).
// The phone is passed hand to hand: young man → church auntie → office worker
// → student. Each smiles on receiving it, then turns worried. A dotted trail
// marks the chain of trust. Ends on "THOUSANDS OF GHANAIANS".
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { ParallaxLayer } from "../components/KenBurns";
import { PhonePass } from "../components/PhonePass";
import { TextSlam } from "../components/TextSlam";
import { alpha } from "../lib/color";
import { useTheme } from "../lib/theme-context";
import { CAST } from "../config/cast";
import { sceneFrames } from "../config/timeline";
import { VIDEO } from "../config/video";

export const Scene3CWPC: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  return (
    <SceneFrame pushDuration={sceneFrames("cwpc") + VIDEO.whipFrames}>
      {/* Warm spotlights + floor */}
      <ParallaxLayer depth={0.7}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 72%, ${alpha(colors.gold, 0.16)}, transparent 60%)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1262, bottom: 0, background: "#101A31" }} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", left: 100 + i * 220 + 10, top: 1240, width: 200, height: 40, borderRadius: "50%", background: alpha(colors.gold, 0.08 + 0.04 * Math.sin((frame + i * 20) / 25)) }} />
        ))}
      </ParallaxLayer>
      <ParallaxLayer depth={1.2}>
        <div style={{ position: "absolute", left: 90, top: 560 }}>
          <PhonePass
            people={[CAST.youngMan, CAST.churchAuntie, CAST.officeWorker, CAST.student]}
            width={900}
            height={720}
            personHeight={510}
            startAt={72}
            holdFrames={60}
            travelFrames={22}
            worryDelay={92}
            phoneRedAt={462}
          />
        </div>
      </ParallaxLayer>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
        <TextSlam text="CWPC" at={8} exitAt={448} fontSize={210} color={colors.gold} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center" }}>
        <TextSlam text={"THOUSANDS OF\nGHANAIANS"} at={458} fontSize={140} highlight={{ GHANAIANS: colors.gold }} />
      </div>
    </SceneFrame>
  );
};
