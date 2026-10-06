// SceneFrame: the wrapper every scene sits in. It applies the global motion
// rules so individual scenes don't have to:
//   • background colour (navy by default)
//   • slow ~3% push-in (via KenBurns) across the whole scene
//   • soft vignette + animated paper grain on top
import React from "react";
import { AbsoluteFill } from "remotion";
import { GrainOverlay, GrainOverlayProps } from "./GrainOverlay";
import { KenBurns } from "./KenBurns";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type SceneFrameProps = ThemableProps & {
  children: React.ReactNode;
  /** Push-in amount (0.03 = 3%). Set 0 to disable. */
  push?: number;
  /** Frames over which the push happens. Defaults to the Sequence/composition length. */
  pushDuration?: number;
  /** Background (any CSS background value; defaults to theme navy). */
  background?: string;
  /** Vignette darkness 0–1. */
  vignette?: number;
  /** Grain settings, or false to switch grain off. */
  grain?: GrainOverlayProps | false;
  /** Content that should NOT be pushed (e.g. fixed UI labels). */
  overlay?: React.ReactNode;
};

export const SceneFrame: React.FC<SceneFrameProps> = ({
  children,
  push = 0.03,
  pushDuration,
  background,
  vignette = 0.35,
  grain = {},
  overlay,
  ...themable
}) => {
  const { colors } = useTheme(themable);
  return (
    <AbsoluteFill style={{ background: background ?? colors.navy, overflow: "hidden" }}>
      <KenBurns amount={push} duration={pushDuration}>
        {children}
      </KenBurns>
      {overlay}
      {vignette > 0 ? (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            background: `radial-gradient(ellipse at center, transparent 55%, ${colors.ink} 140%)`,
            opacity: vignette,
          }}
        />
      ) : null}
      {grain ? <GrainOverlay {...grain} /> : null}
    </AbsoluteFill>
  );
};
