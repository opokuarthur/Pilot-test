// Scene 2 — Who is he? (0:12–0:35).
// "RNAQ" title with his photo as a big centred sticker; the sticker then
// settles waist-up on the right, rising from behind the ground band, and
// rides along a timeline past four stops: Jamestown → a kitchen abroad →
// stacks of cash → car + jet. He faces left, so he sits on the right looking
// into each scene; between stops he slides with a small bob (no walk).
import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { TimelineWalk } from "../../components/TimelineWalk";
import { TextSlam } from "../../components/TextSlam";
import { PhotoCutout } from "../../components/PhotoCutout";
import { alpha } from "../../lib/color";
import { useTheme } from "../../lib/theme-context";
import { platesPushFrames } from "../timeline";
import { RNAQ_PHOTO } from "../credits";
import { CarAndJet, CashStacks, JamestownStreet, KitchenSink } from "../stops";

const ARRIVALS = [100, 280, 400, 530];
const CONFETTI = 580;
const GROUND = 1190;

const PHOTO_IN = 12;
/** Sticker moves from the title layout to the stop layout over these frames. */
const SETTLE = [78, 100];
const TITLE_W = 600; // ≈56% of the frame
const TITLE_POS = { left: 540 - TITLE_W / 2, top: 470 };
const STOP_SCALE = 0.75; // → 450px ≈ 42% of the frame
const PHOTO_H = TITLE_W / RNAQ_PHOTO.aspect;
/** Bottom edge sits this far below the ground line, hidden by the ground band. */
const HIDE = 40;
// Scaled about its bottom-centre: right edge at x=975, bottom edge HIDE px below the ground.
const STOP_POS = { left: 975 - TITLE_W / 2 - (TITLE_W * STOP_SCALE) / 2, top: GROUND + HIDE - PHOTO_H };

export const Scene2Who: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors, fonts } = useTheme();
  const settle = interpolate(frame, SETTLE, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const creditIn = interpolate(frame, [PHOTO_IN + 4, PHOTO_IN + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneFrame pushDuration={platesPushFrames("who")} background={`linear-gradient(${colors.navy}, #1E2E52)`}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 62%, ${alpha(colors.gold, 0.14)} 0%, transparent 55%)` }} />
      <TimelineWalk
        arrivals={ARRIVALS}
        walkFrames={50}
        groundY={GROUND}
        labelY={250}
        labelSize={112}
        stops={[
          { label: "JAMESTOWN", node: <JamestownStreet /> },
          { label: "KITCHEN ABROAD", node: <KitchenSink /> },
          { label: "MILLIONAIRE AT 27", node: <CashStacks />, labelColor: colors.gold },
          { label: "40: BUGATTI + JET", node: <CarAndJet confettiAt={CONFETTI} />, labelColor: colors.navy, labelPlate: colors.gold },
        ]}
        renderFigure={({ move }) => {
          // Slide: lag a little behind the camera, bob and lean while moving.
          const slideX = -70 * move;
          const bobY = -Math.abs(Math.sin(frame / 4)) * 12 * move;
          const lean = -2.5 * move;
          const left = interpolate(settle, [0, 1], [TITLE_POS.left, STOP_POS.left]) + slideX;
          const top = interpolate(settle, [0, 1], [TITLE_POS.top, STOP_POS.top]) + bobY;
          const scale = interpolate(settle, [0, 1], [1, STOP_SCALE]);
          return (
            <div style={{ position: "absolute", left, top, transform: `scale(${scale}) rotate(${lean}deg)`, transformOrigin: "50% 100%" }}>
              <PhotoCutout
                src={staticFile(RNAQ_PHOTO.file)}
                aspect={RNAQ_PHOTO.aspect}
                width={TITLE_W}
                border={16}
                warmth={0.3}
                appearAt={PHOTO_IN}
                float={interpolate(settle, [0, 1], [8, 2.5])}
              />
            </div>
          );
        }}
      />
      {/* Intro name tag before the walk starts */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center" }}>
        <TextSlam text="RNAQ" at={8} exitAt={88} fontSize={170} color={colors.gold} />
      </div>
      {/* Photo credit: bottom-left, on the ground band, above the captions */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: GROUND + 84,
          opacity: creditIn * 0.8,
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 1,
          color: colors.cream,
        }}
      >
        {RNAQ_PHOTO.credit}
      </div>
    </SceneFrame>
  );
};
