// Scene 2 — Who is he? (0:12–0:35).
// A silhouette seen from behind (never a face) walks along a timeline past
// four stops: Jamestown → a kitchen abroad → stacks of cash → car + jet.
import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { TimelineWalk } from "../../components/TimelineWalk";
import { TextSlam } from "../../components/TextSlam";
import { alpha } from "../../lib/color";
import { useTheme } from "../../lib/theme-context";
import { platesPushFrames } from "../timeline";
import { CarAndJet, CashStacks, JamestownStreet, KitchenSink } from "../stops";

const ARRIVALS = [100, 280, 400, 530];
const CONFETTI = 580;

export const Scene2Who: React.FC = () => {
  const { colors } = useTheme();
  return (
    <SceneFrame pushDuration={platesPushFrames("who")} background={`linear-gradient(${colors.navy}, #1E2E52)`}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 62%, ${alpha(colors.gold, 0.14)} 0%, transparent 55%)` }} />
      <TimelineWalk
        arrivals={ARRIVALS}
        walkFrames={50}
        groundY={1190}
        figureX={250}
        figureHeight={420}
        labelY={250}
        labelSize={112}
        stops={[
          { label: "JAMESTOWN", node: <JamestownStreet /> },
          { label: "KITCHEN ABROAD", node: <KitchenSink /> },
          { label: "MILLIONAIRE AT 27", node: <CashStacks />, labelColor: colors.gold },
          { label: "40: BUGATTI + JET", node: <CarAndJet confettiAt={CONFETTI} />, labelColor: colors.navy, labelPlate: colors.gold },
        ]}
      />
      {/* Intro name tag before the walk starts */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center" }}>
        <TextSlam text="RNAQ" at={8} exitAt={88} fontSize={170} color={colors.gold} />
      </div>
    </SceneFrame>
  );
};
