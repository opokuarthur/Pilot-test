// Scene 2 — The plan (0:15–0:45).
// Plane cabin at night: the GOODBYE letter drops in; on "begged him to stay"
// a hand pushes it back. "NEW COACH" slams; on "Jorge Jesus" his cutout
// slides in with "JORGE JESUS — HEAD COACH" (neutral: no tint or effects),
// then slides out. The #7 and coach silhouettes shake hands, and the plan
// clipboard ticks "MATCH 1" and "FINAL MATCH". "SIMPLE." stamps on.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { GoodbyeLetter } from "../../components/GoodbyeLetter";
import { Clipboard } from "../../components/Clipboard";
import { Coach, Player } from "../../components/Silhouettes";
import { SlamAt, TextSlam } from "../../components/TextSlam";
import { alpha } from "../../lib/color";
import { useTheme } from "../../lib/theme-context";
import { rvjPushFrames } from "../timeline";
import { PhotoMoment } from "../photos";
import { PlaneCabin } from "../sets";

const LETTER = 100; // "goodbye letter" (3.4 s)
const PUSH = 228; // "begged him to stay" (7.6 s)
const NEW_COACH = 308; // "the new coach" (10.2 s)
const PHOTO = 402; // "Jorge Jesus" (13.4 s)
const PHOTO_OUT = 522;
const CABIN_OUT = [500, 530];
const SHAKE = 536; // "Jesus came with a plan" (17.8 s)
const BOARD = 580;
const MATCH1 = 598; // "the first match" (19.8 s)
const FINAL = 676; // "and the last one" (22.4 s)
const SIMPLE = 740; // "Simple." (24.6 s)

/** Handshake: the two silhouettes slide in from the sides; hands meet at x=540. */
const Handshake: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < SHAKE) return null;
  const p = spring({ frame: frame - SHAKE, fps, config: { damping: 14, mass: 0.8 } });
  const H = 500;
  const scale = H / 430;
  // Hand at local x 226 (player) / -26 mirrored (coach), viewBox starts at x=-60.
  const playerLeft = 540 - (226 + 60) * scale;
  const coachLeft = 540 - (-26 + 60) * scale;
  const pump = frame > SHAKE + 14 ? Math.sin((frame - SHAKE) / 4) * 6 * Math.max(0, 1 - (frame - SHAKE - 14) / 50) : 0;
  return (
    <>
      <Player x={playerLeft - (1 - p) * 700} y={1270 + pump} height={H} pose="reach" />
      <Coach x={coachLeft + (1 - p) * 700} y={1270 + pump} height={H} pose="reach" flip />
    </>
  );
};

export const Scene2Plan: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const cabin = interpolate(frame, CABIN_OUT, [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneFrame pushDuration={rvjPushFrames("plan")} background={`linear-gradient(${colors.navy}, #1E2E52)`}>
      {cabin > 0 ? <PlaneCabin opacity={cabin} /> : null}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 70%, ${alpha(colors.gold, 0.14 * (1 - cabin))} 0%, transparent 55%)` }} />
      {/* Goodbye letter */}
      <div style={{ position: "absolute", left: 540 - 260, top: 420 }}>
        <GoodbyeLetter appearAt={LETTER} pushAt={PUSH} width={520} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", justifyContent: "center" }}>
        <TextSlam text="NEW COACH" at={NEW_COACH} exitAt={PHOTO_OUT} fontSize={130} color={colors.navy} plate={colors.gold} rotate={-2} />
      </div>
      {/* Jorge Jesus: neutral presentation */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center" }}>
        <PhotoMoment photo="jesus" appearAt={PHOTO} exitAt={PHOTO_OUT} width={540} from="left" rotate={-2} tagAt={PHOTO + 8} />
      </div>
      <Handshake />
      <div style={{ position: "absolute", left: 540 - 280, top: 190 }}>
        <Clipboard
          width={560}
          appearAt={BOARD}
          items={[
            { text: "MATCH 1", at: MATCH1 },
            { text: "FINAL MATCH", at: FINAL },
          ]}
        />
      </div>
      <SlamAt y={650} x={760}>
        <TextSlam text="SIMPLE." at={SIMPLE} fontSize={96} color={colors.cream} plate={colors.red} rotate={-8} fromScale={2} />
      </SlamAt>
    </SceneFrame>
  );
};
