// KenBurns: wraps any content in a slow push-in (default 3% over its duration).
// For depth, put children in <ParallaxLayer depth={…}>: depth 1 moves with the
// camera, >1 is "closer" (moves more), <1 is "further away" (moves less).
import React, { createContext, useContext } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type Ctx = { progress: number; amount: number; drift: number };
const KenBurnsContext = createContext<Ctx>({ progress: 0, amount: 0, drift: 0 });

export type KenBurnsProps = {
  children: React.ReactNode;
  /** Zoom amount: 0.03 = 3%. */
  amount?: number;
  /** Frames for the full push (defaults to the Sequence length). */
  duration?: number;
  /** Vertical drift in px at depth 1 (positive = content moves up). */
  drift?: number;
  /** Zoom origin, CSS transform-origin. */
  origin?: string;
  style?: React.CSSProperties;
};

export const KenBurns: React.FC<KenBurnsProps> = ({
  children,
  amount = 0.03,
  duration,
  drift = 0,
  origin = "50% 45%",
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, duration ?? durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <KenBurnsContext.Provider value={{ progress, amount, drift }}>
      <AbsoluteFill
        style={{
          transform: `scale(${1 + amount * progress}) translateY(${-drift * progress}px)`,
          transformOrigin: origin,
          ...style,
        }}
      >
        {children}
      </AbsoluteFill>
    </KenBurnsContext.Provider>
  );
};

/** A layer that moves a bit more (depth > 1) or less (depth < 1) than the camera push. */
export const ParallaxLayer: React.FC<{ depth?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  depth = 1,
  children,
  style,
}) => {
  const { progress, amount, drift } = useContext(KenBurnsContext);
  const extra = depth - 1;
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${1 + amount * progress * extra}) translateY(${-drift * progress * extra}px)`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
