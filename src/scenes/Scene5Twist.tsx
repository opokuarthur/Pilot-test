// Scene 5 — The twist (1:15–1:50).
//   A  0–200    Big split-flap calendar shows 2026, "REWIND" riffles to 2018,
//               then the calendar shrinks to the top.
//   B  200–510  2018: upscale gold office rises, "MENZGOLD" slams, shutters slam
//               down, an angry crowd gathers.
//   C  510–860  Riffle to 2015: small rural office, "DKM", worried queue,
//               counters "99,858 CLAIMS" and "GH₵502M".
//   D  860–end  Everything dims: "DIFFERENT NAMES. SAME STORY."
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { ParallaxLayer } from "../components/KenBurns";
import { CalendarFlip } from "../components/CalendarFlip";
import { Building } from "../components/Building";
import { Crowd } from "../components/Crowd";
import { TextSlam } from "../components/TextSlam";
import { alpha } from "../lib/color";
import { useTheme } from "../lib/theme-context";
import { sceneFrames } from "../config/timeline";
import { VIDEO } from "../config/video";

const FLIP_2018 = 165;
const FLIP_2015 = 515;
const FLIP_FRAMES = 40;
const SHRINK = 208;
const B_IN = 214;
const SHUTTERS = 286;
const B_OUT = 505;
const C_IN = 548;
const OUTRO = 862;
const SAME_STORY = 930;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Scene5Twist: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, fonts } = useTheme();

  // Calendar: big + centred, then small at the top.
  const shrink = interpolate(frame, [SHRINK, SHRINK + 22], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const calScale = interpolate(shrink, [0, 1], [1.25, 0.55]);
  const calY = interpolate(shrink, [0, 1], [760, 300]);
  const calIn = spring({ frame: frame - 4, fps, config: { damping: 14 } });
  const rewinding = (frame >= FLIP_2018 - 4 && frame < FLIP_2018 + FLIP_FRAMES + 2) || (frame >= FLIP_2015 - 4 && frame < FLIP_2015 + FLIP_FRAMES + 2);

  // Set B (2018) in/out.
  const bIn = spring({ frame: frame - B_IN, fps, config: { damping: 15, mass: 0.8 } });
  const bOut = interpolate(frame, [B_OUT, B_OUT + 18], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  // Set C (2015).
  const cIn = spring({ frame: frame - C_IN, fps, config: { damping: 15, mass: 0.8 } });
  const outro = interpolate(frame, [OUTRO, OUTRO + 14], [0, 1], clamp);

  return (
    <SceneFrame pushDuration={sceneFrames("twist") + VIDEO.whipFrames}>
      {/* Ground */}
      <ParallaxLayer depth={0.8}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1240, bottom: 0, background: "#101A31", opacity: shrink }} />
      </ParallaxLayer>

      {/* B: 2018 — upscale office + angry crowd */}
      {frame >= B_IN - 2 && bOut < 1 ? (
        <AbsoluteFill style={{ transform: `translateY(${(1 - bIn) * 500 + bOut * 700}px)`, opacity: 1 - bOut }}>
          <ParallaxLayer depth={0.9}>
            <div style={{ position: "absolute", left: 260, top: 520 }}>
              <Building variant="upscale" width={560} shutterAt={SHUTTERS} closedSign />
            </div>
          </ParallaxLayer>
          <ParallaxLayer depth={1.3}>
            <div style={{ position: "absolute", left: 110, top: 900 }}>
              <Crowd count={12} layout="cluster" width={860} height={390} personHeight={340} mood="angry" appearAt={SHUTTERS + 8} stagger={3} seed="menz" />
            </div>
          </ParallaxLayer>
        </AbsoluteFill>
      ) : null}

      {/* C: 2015 — small rural office + worried queue */}
      {frame >= C_IN - 2 ? (
        <AbsoluteFill style={{ transform: `translateY(${(1 - cIn) * 500}px)` }}>
          <ParallaxLayer depth={0.9}>
            <div style={{ position: "absolute", left: 260, top: 700 - 370 * (560 / 600) }}>
              <Building variant="rural" width={560} />
            </div>
          </ParallaxLayer>
          <ParallaxLayer depth={1.3}>
            <div style={{ position: "absolute", left: 100, top: 900 }}>
              <Crowd count={8} layout="queue" width={880} height={390} personHeight={320} mood="worried" appearAt={C_IN + 10} stagger={5} queueTarget={{ x: 440, y: 110 }} seed="dkm" />
            </div>
          </ParallaxLayer>
        </AbsoluteFill>
      ) : null}

      {/* Slams */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 410, display: "flex", justifyContent: "center" }}>
        <TextSlam text="MENZGOLD" at={B_IN + 4} exitAt={B_OUT} fontSize={150} color={colors.gold} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 410, display: "flex", justifyContent: "center" }}>
        <TextSlam text="DKM" at={C_IN + 4} exitAt={638} fontSize={160} color={colors.gold} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 405, display: "flex", justifyContent: "center" }}>
        <TextSlam text="" count={{ from: 0, to: 99858, frames: 45, suffix: " CLAIMS" }} at={644} exitAt={OUTRO} fontSize={112} color={colors.cream} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 545, display: "flex", justifyContent: "center" }}>
        <TextSlam text="" count={{ from: 0, to: 502, frames: 40, prefix: "GH₵", suffix: "M" }} at={746} exitAt={OUTRO} fontSize={130} color={colors.gold} />
      </div>

      {/* Calendar (above the sets) */}
      <div style={{ position: "absolute", left: 540, top: calY, transform: `translate(-50%, -50%) scale(${calScale * calIn})`, opacity: 1 - outro }}>
        <CalendarFlip
          years={[
            { at: 0, year: 2026 },
            { at: FLIP_2018, year: 2018 },
            { at: FLIP_2015, year: 2015 },
          ]}
          flipFrames={FLIP_FRAMES}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "100%",
            marginTop: 26,
            transform: "translateX(-50%)",
            fontFamily: fonts.body,
            fontWeight: 800,
            fontSize: 44,
            letterSpacing: 10,
            color: colors.red,
            opacity: rewinding ? 0.55 + 0.45 * Math.sin(frame / 2) : 0,
            whiteSpace: "nowrap",
          }}
        >
          ◀◀ REWIND
        </div>
      </div>

      {/* D: outro */}
      {outro > 0 ? (
        <>
          <AbsoluteFill style={{ background: alpha(colors.navy, 0.86 * outro) }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center" }}>
            <TextSlam text="DIFFERENT NAMES." at={OUTRO + 2} fontSize={118} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 740, display: "flex", justifyContent: "center" }}>
            <TextSlam text="SAME STORY." at={SAME_STORY} fontSize={150} color={colors.gold} rotate={-3} />
          </div>
        </>
      ) : null}
    </SceneFrame>
  );
};
