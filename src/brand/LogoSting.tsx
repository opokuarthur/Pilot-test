// LogoSting (2 s): a closed folded sheet drops into the centre with a soft
// bounce, then unfolds panel by panel (top third, then bottom third) with a
// small paper flap overshoot and a slight 3D tilt. As it lies flat the gold
// creases glow, and the LET’S / UNFOLD wordmark slams across the open sheet
// with an overshoot. Holds on the final logo for ~0.4 s. Grain on top.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "./config";
import { BrandIcon } from "./BrandIcon";
import { BrandLogo } from "./BrandLogo";
import { GrainOverlay } from "../components/GrainOverlay";

/** Sting length in frames at a given fps. */
export const stingFrames = (fps: number) => Math.round(BRAND.timing.sting * fps);

// Key moments as fractions of the sting (scaled to its length).
const T = { drop: 0, top: 0.24, bottom: 0.4, flat: 0.62, slam: 0.62, hold: 0.8 };

/** Paper flap: 180° (folded) → 0° (flat) with a little overshoot past flat. */
const flap = (frame: number, at: number, fps: number) => {
  const s = spring({ frame: frame - at, fps, config: { damping: 11, mass: 0.55, stiffness: 150 } });
  return 180 * (1 - s);
};

export const LogoSting: React.FC<{ background?: string }> = ({ background }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const n = Math.min(durationInFrames, stingFrames(fps));
  const at = (k: keyof typeof T) => Math.round(T[k] * n);

  // Drop in with a soft bounce.
  const drop = spring({ frame: frame - at("drop"), fps, config: { damping: 9, mass: 0.7, stiffness: 140 } });
  const y = interpolate(drop, [0, 1], [-900, 0]);
  // Unfold: top third first (it lies on top), then the bottom third.
  const top = Math.max(-8, Math.min(180, flap(frame, at("top"), fps)));
  const bottom = Math.max(-8, Math.min(180, flap(frame, at("bottom"), fps)));
  // Slight 3D tilt that settles as the sheet opens.
  const tilt = interpolate(frame, [at("top"), at("flat")], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = interpolate(frame, [at("flat") - 2, at("flat") + 4, at("hold") + 4], [0, 1, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Wordmark slam.
  const slam = spring({ frame: frame - at("slam"), fps, config: { damping: 9, mass: 0.6, stiffness: 170 } });
  const slamScale = interpolate(slam, [0, 1], [2.3, 1]);
  const slamOpacity = interpolate(frame - at("slam"), [0, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = frame >= at("slam") + 4 && frame < at("slam") + 12 ? Math.sin((frame - at("slam")) * 2.4) * 8 * (1 - (frame - at("slam") - 4) / 8) : 0;

  const iconSize = Math.min(width * 1.25, height * 0.7);
  return (
    <AbsoluteFill style={{ background: background ?? BRAND.colors.navy, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${BRAND.colors.gold}33 0%, transparent 55%)`, opacity: 0.5 + 0.5 * glow }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", perspective: 1600, transform: `translate(${shake}px, 0)` }}>
        <div style={{ transform: `translateY(${y}px) rotateX(${tilt}deg)`, transformOrigin: "50% 50%" }}>
          <BrandIcon size={iconSize} fold={{ top, bottom }} showU uPlacement="outside" creaseGlow={glow} grain={1} />
        </div>
      </AbsoluteFill>
      {frame >= at("slam") ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scale(${slamScale}) rotate(-2deg)`, opacity: slamOpacity }}>
            {/* Sized to sit inside the middle third, clear of the creases */}
            <BrandLogo variant="wordmark" width={iconSize * 0.37} color={BRAND.colors.navy} accent={BRAND.colors.gold} />
          </div>
        </AbsoluteFill>
      ) : null}
      <GrainOverlay />
    </AbsoluteFill>
  );
};
