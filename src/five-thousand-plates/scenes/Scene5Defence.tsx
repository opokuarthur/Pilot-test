// Scene 5 — His defence (1:25–1:50).
// A tall hotel whose windows light up one by one ("THOUSANDS OF GUESTS",
// "+ FOOD PREP"). Then a clearly hypothetical "IMAGINE": one breakfast tray
// multiplies into a grid, and MathWrite does 1,000 × 3 × 2 = 6,000.
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { SceneFrame } from "../../components/SceneFrame";
import { HotelBuilding } from "../../components/HotelBuilding";
import { BreakfastTray } from "../../components/BreakfastTray";
import { MathWrite } from "../../components/MathWrite";
import { TextSlam } from "../../components/TextSlam";
import { useTheme } from "../../lib/theme-context";
import { platesPushFrames } from "../timeline";

const HOTEL_OUT = 392;
const IMAGINE = 412;
const TRAY_IN = 420;
const MULTIPLY = 498;
const HOTEL_W = 500;

export const Scene5Defence: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const out = interpolate(frame, [HOTEL_OUT, HOTEL_OUT + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const night = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: "clamp" });
  return (
    <SceneFrame pushDuration={platesPushFrames("defence")} background={`linear-gradient(#0E1830, ${colors.navy})`}>
      {/* Night sky with a few stars */}
      <AbsoluteFill style={{ opacity: night * (1 - out) }}>
        {Array.from({ length: 24 }, (_, k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              left: (k * 137) % 1000 + 40,
              top: (k * 89) % 520 + 150,
              width: 5,
              height: 5,
              borderRadius: 3,
              background: colors.cream,
              opacity: 0.25 + 0.35 * Math.abs(Math.sin((frame + k * 13) / 20)),
            }}
          />
        ))}
      </AbsoluteFill>
      {out < 1 ? (
        <AbsoluteFill style={{ transform: `translateY(${-out * 300}px)`, opacity: 1 - out }}>
          <div style={{ position: "absolute", left: 540 - HOTEL_W / 2, top: 340 }}>
            <HotelBuilding width={HOTEL_W} floors={12} cols={6} lightsAt={18} lightStagger={3} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 180, display: "flex", justifyContent: "center" }}>
            <TextSlam text="HIS SIDE" at={8} fontSize={120} color={colors.gold} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center" }}>
            <TextSlam text={"THOUSANDS\nOF GUESTS"} at={134} exitAt={290} fontSize={104} color={colors.navy} plate={colors.gold} rotate={-3} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 720, display: "flex", justifyContent: "center" }}>
            <TextSlam text="+ FOOD PREP" at={300} fontSize={104} color={colors.cream} plate={colors.red} rotate={2} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* Hypothetical */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 175, display: "flex", justifyContent: "center" }}>
        <TextSlam text="IMAGINE" at={IMAGINE} fontSize={84} color={colors.navy} plate={colors.gold} rotate={-3} />
      </div>
      <div style={{ position: "absolute", left: (1080 - (4 * 200 + 3 * 18)) / 2, top: 320 }}>
        <BreakfastTray cols={4} rows={4} cellWidth={200} gap={18} heroScale={2.6} appearAt={TRAY_IN} multiplyAt={MULTIPLY} stagger={3} />
      </div>
      <div style={{ position: "absolute", left: 100, top: 980 }}>
        <MathWrite
          width={880}
          fontSize={60}
          lines={[
            { text: "1,000 guests × 3 meals × 2 plates", at: MULTIPLY + 4, charFrames: 1.2 },
            { text: "= *6,000 plates*", at: 594, fontSize: 112, underline: true },
          ]}
        />
      </div>
    </SceneFrame>
  );
};
