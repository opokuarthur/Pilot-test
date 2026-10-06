// Scene 1 — Cold open (0:00–0:15).
// Hand holding the investment app: balance counts 500 → 2,000, tap withdraw →
// Pending, tap again → Pending, tap again → screen cracks and goes grey.
// "You're not alone": other phones stuck on Pending pop up in the background.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { HandPhone } from "../components/HandPhone";
import { ParallaxLayer } from "../components/KenBurns";
import { pop } from "../lib/motion";
import { alpha } from "../lib/color";
import { useTheme } from "../lib/theme-context";
import { sceneFrames } from "../config/timeline";
import { VIDEO } from "../config/video";

const TAPS = [150, 228, 268];
const CRACK = 305;
const OTHERS_AT = 384;

/** Small background phone stuck on a red pending spinner. */
const MiniPending: React.FC<{ x: number; y: number; at: number; rot: number }> = ({ x, y, at, rot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();
  const p = pop(frame, fps, at);
  if (p <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${p}) rotate(${rot + Math.sin((frame + x) / 30) * 3}deg)`, opacity: 0.85 }}>
      <svg width={120} height={210} viewBox="0 0 120 210">
        <rect width={120} height={210} rx={22} fill="#0A0B0E" />
        <rect x={8} y={8} width={104} height={194} rx={16} fill="#0E1830" />
        <circle cx={60} cy={95} r={22} stroke={alpha(colors.red, 0.3)} strokeWidth={7} fill="none" />
        <path d="M60 73 A22 22 0 0 1 82 95" stroke={colors.red} strokeWidth={7} fill="none" strokeLinecap="round" transform={`rotate(${frame * 10} 60 95)`} />
        <rect x={26} y={140} width={68} height={12} rx={6} fill={alpha(colors.red, 0.8)} />
      </svg>
    </div>
  );
};

export const Scene1ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const pendingGlow = interpolate(frame, [TAPS[0] + 6, TAPS[0] + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 0.75 + Math.sin(frame / 8) * 0.25;
  const enter = interpolate(frame, [0, 18], [120, 0], { extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
  const others = [
    { x: 40, y: 260, rot: -12 },
    { x: 920, y: 330, rot: 10 },
    { x: 70, y: 760, rot: 8 },
    { x: 930, y: 820, rot: -9 },
    { x: 150, y: 1100, rot: -6 },
    { x: 840, y: 1130, rot: 7 },
  ];
  return (
    <SceneFrame pushDuration={sceneFrames("coldOpen") + VIDEO.whipFrames}>
      {/* Gold glow behind the phone turns red once it's pending */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 38%, ${alpha(colors.gold, 0.22 * (1 - pendingGlow))} 0%, ${alpha(colors.red, 0.28 * pendingGlow * pulse)} 22%, transparent 55%)`,
        }}
      />
      <ParallaxLayer depth={0.6}>
        {others.map((o, i) => (
          <MiniPending key={i} x={o.x} y={o.y} rot={o.rot} at={OTHERS_AT + i * 5} />
        ))}
      </ParallaxLayer>
      <ParallaxLayer depth={1.4}>
        <AbsoluteFill style={{ alignItems: "center", top: 140 + enter }}>
          <HandPhone
            width={720}
            phone={{ balanceFrom: 500, balanceTo: 2000, countAt: 70, countFrames: 50, taps: TAPS, crackAt: CRACK }}
          />
        </AbsoluteFill>
      </ParallaxLayer>
    </SceneFrame>
  );
};
