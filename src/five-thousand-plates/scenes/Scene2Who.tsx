// Scene 2 — Who is he? (0:12–0:35).
// "RNAQ" title with his photo as a big centred sticker; the sticker then
// settles waist-up on the right, rising from behind the ground band, and
// rides along a timeline past four stops: Jamestown → a kitchen abroad →
// stacks of cash → car + jet. He faces left, so he sits on the right looking
// into each scene; between stops he slides with a small bob (no walk).
//
// Real photos (only when their files are present in public/, see credits.ts):
//   • on "Jamestown" the illustration wipes into the real Jamestown photo
//     (slow push-in, "THE REAL JAMESTOWN" tag), and wipes back before the
//     camera moves on;
//   • at the last stop the generic car is replaced by the Bugatti photo card
//     and the portrait cutout sinks behind the ground so he isn't shown twice.
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { TimelineWalk } from "../../components/TimelineWalk";
import { TextSlam } from "../../components/TextSlam";
import { PhotoCutout } from "../../components/PhotoCutout";
import { PhotoCard } from "../../components/PhotoCard";
import { alpha } from "../../lib/color";
import { useTheme } from "../../lib/theme-context";
import { platesPushFrames } from "../timeline";
import { PHOTOS, RNAQ_PHOTO, hasPhoto } from "../credits";
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

/** Jamestown reveal: wipe in on "Jamestown", wipe back before the camera moves on. */
const REVEAL_IN = [108, 126];
const REVEAL_OUT = [204, 222];
/** Bugatti stop: portrait sinks away, photo card slides in. */
const HIDE_CUTOUT = [ARRIVALS[3] - 50, ARRIVALS[3] - 26];
const BUGATTI_IN = ARRIVALS[3] + 4;
const BUGATTI_BOTTOM = 1182;

/** Illustrated Jamestown with the real photo wiping in over it (stop box: 880×760). */
const JamestownStop: React.FC<{ photo: boolean }> = ({ photo }) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const p = photo
    ? Math.min(
        interpolate(frame, REVEAL_IN, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }),
        interpolate(frame, REVEAL_OUT, [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }),
      )
    : 0;
  const push = 1 + 0.07 * interpolate(frame, [REVEAL_IN[0], REVEAL_OUT[1]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      {/* The illustration fades out under the photo so none of it peeks around the edges. */}
      <AbsoluteFill style={{ opacity: 1 - p }}>
        <JamestownStreet />
      </AbsoluteFill>
      {p > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              position: "relative",
              lineHeight: 0,
              overflow: "hidden",
              borderRadius: 18,
              // Wipe in left → right; wipe back right → left.
              clipPath: `inset(0 ${(1 - p) * 100}% 0 0 round 18px)`,
              boxShadow: `0 20px 40px ${alpha("#000000", 0.45)}`,
            }}
          >
            <Img
              src={staticFile(PHOTOS.jamestown.file)}
              style={{ display: "block", maxWidth: 880, maxHeight: 760, width: "auto", height: "auto", transform: `scale(${push})`, transformOrigin: "50% 60%", filter: "sepia(0.04) saturate(1.02)" }}
            />
            <div style={{ position: "absolute", left: 28, top: 28, lineHeight: 1 }}>
              <TextSlam text="THE REAL JAMESTOWN" at={REVEAL_IN[1] - 4} fontSize={50} color={colors.navy} plate={colors.gold} rotate={-2} fromScale={1.6} />
            </div>
          </div>
          {/* Cream wipe edge */}
          {p > 0.01 && p < 0.99 ? (
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `calc(${p * 100}% - 6px)`, width: 12, borderRadius: 6, background: colors.cream, boxShadow: `0 0 30px ${colors.gold}` }} />
          ) : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Scene2Who: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors, fonts } = useTheme();
  const jamestownPhoto = hasPhoto(PHOTOS.jamestown.file);
  const bugattiPhoto = hasPhoto(PHOTOS.bugatti.file);
  const revealOn = jamestownPhoto && frame >= REVEAL_IN[0] && frame < REVEAL_OUT[1];
  const hide = bugattiPhoto
    ? interpolate(frame, HIDE_CUTOUT, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) })
    : 0;
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
          { label: "JAMESTOWN", node: <JamestownStop photo={jamestownPhoto} /> },
          { label: "KITCHEN ABROAD", node: <KitchenSink /> },
          { label: "MILLIONAIRE AT 27", node: <CashStacks />, labelColor: colors.gold },
          { label: "40: BUGATTI + JET", node: <CarAndJet confettiAt={CONFETTI} photoMode={bugattiPhoto} />, labelColor: colors.navy, labelPlate: colors.gold },
        ]}
        renderFigure={({ move }) => {
          // Slide: lag a little behind the camera, bob and lean while moving.
          const slideX = -70 * move;
          const bobY = -Math.abs(Math.sin(frame / 4)) * 12 * move;
          const lean = -2.5 * move;
          const left = interpolate(settle, [0, 1], [TITLE_POS.left, STOP_POS.left]) + slideX;
          // Sinks behind the ground band before the Bugatti photo arrives.
          const top = interpolate(settle, [0, 1], [TITLE_POS.top, STOP_POS.top]) + bobY + hide * (PHOTO_H + 80);
          if (hide >= 1) return null;
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
      {/* Real Bugatti photo card (replaces the illustrated car) */}
      {bugattiPhoto ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 1920 - BUGATTI_BOTTOM, display: "flex", justifyContent: "center" }}>
          <PhotoCard
            src={staticFile(PHOTOS.bugatti.file)}
            maxWidth={760}
            maxHeight={440}
            rotate={2.5}
            appearAt={BUGATTI_IN}
            from="right"
            credit={PHOTOS.bugatti.credit}
          />
        </div>
      ) : null}
      {/* Photo credits: bottom-left on the ground band, above the captions */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: GROUND + 72,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 1,
          color: colors.cream,
        }}
      >
        {Array.from(
          new Set([
            ...(hide < 1 ? [RNAQ_PHOTO.credit] : []),
            ...(revealOn ? [PHOTOS.jamestown.credit] : []),
          ]),
        ).map((c) => (
          <div key={c} style={{ opacity: creditIn * 0.8 * (c === RNAQ_PHOTO.credit ? 1 - hide : 1) }}>
            {c}
          </div>
        ))}
      </div>
    </SceneFrame>
  );
};
