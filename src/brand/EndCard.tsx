// EndCard (3 s, plays right after the sting): navy, the full logo near the
// top, the closing catchphrase in gold Anton, the follow line in cream Inter,
// and a small arrow pointing up toward where the platform's follow button
// usually sits (TikTok: under the avatar on the right rail).
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "./config";
import { BrandLogo } from "./BrandLogo";
import { GrainOverlay } from "../components/GrainOverlay";
import { shade } from "../lib/color";

/** End card length in frames at a given fps. */
export const endCardFrames = (fps: number) => Math.round(BRAND.timing.endCard * fps);

export type EndCardProps = {
  /** Where the arrow points (px): the follow button's usual spot. */
  arrowTarget?: { x: number; y: number };
};

export const EndCard: React.FC<EndCardProps> = ({ arrowTarget = { x: 985, y: 1040 } }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { navy, gold, cream } = BRAND.colors;
  const pop = (at: number, cfg = { damping: 12, mass: 0.6, stiffness: 160 }) => spring({ frame: frame - at, fps, config: cfg });

  const logo = pop(0);
  const line = pop(8, { damping: 9, mass: 0.6, stiffness: 170 });
  const follow = pop(18);
  const arrowIn = pop(26);
  const bob = Math.sin(frame / 5) * 14;
  const pulse = (frame % 30) / 30;

  // Arrow: starts below-left of the target and points at it (mostly upward).
  const from = { x: arrowTarget.x - 70, y: arrowTarget.y + 230 };
  const ang = Math.atan2(arrowTarget.y - from.y, arrowTarget.x - from.x);
  const len = 150;
  const ux = Math.cos(ang);
  const uy = Math.sin(ang);
  const tip = { x: from.x + ux * (len + bob * 0.4), y: from.y + uy * (len + bob * 0.4) };

  return (
    <AbsoluteFill style={{ background: navy, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 28%, ${gold}26 0%, transparent 50%)` }} />
      {/* Full logo near the top */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `translateY(${(1 - logo) * -60}px) scale(${0.9 + 0.1 * logo})`, opacity: Math.min(1, logo * 1.5) }}>
          <BrandLogo variant="full" width={820} />
        </div>
      </div>
      {/* Closing catchphrase */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 760, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: BRAND.fonts.headline,
            fontSize: 104,
            lineHeight: 1.02,
            color: gold,
            textAlign: "center",
            transform: `scale(${interpolate(line, [0, 1], [1.8, 1])}) rotate(-1.5deg)`,
            opacity: Math.min(1, line * 3),
            textShadow: `6px 6px 0 ${shade(navy, 0.45)}`,
            letterSpacing: 1,
          }}
        >
          {BRAND.catchphrase.close}
        </div>
      </div>
      {/* Follow line */}
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 1010,
          textAlign: "center",
          fontFamily: BRAND.fonts.body,
          fontWeight: 700,
          fontSize: 46,
          lineHeight: 1.25,
          color: cream,
          transform: `translateY(${(1 - follow) * 30}px)`,
          opacity: follow,
        }}
      >
        {BRAND.follow}
      </div>
      {/* Arrow toward the follow button */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: arrowIn, overflow: "visible" }}>
        <circle cx={arrowTarget.x} cy={arrowTarget.y} r={46 + pulse * 40} fill="none" stroke={gold} strokeWidth={6 * (1 - pulse)} opacity={(1 - pulse) * arrowIn} />
        <line x1={from.x} y1={from.y + bob * 0.4} x2={tip.x - ux * 18} y2={tip.y - uy * 18} stroke={gold} strokeWidth={12} strokeLinecap="round" />
        <path
          d={`M${tip.x} ${tip.y} L${tip.x - ux * 46 - uy * 30} ${tip.y - uy * 46 + ux * 30} L${tip.x - ux * 46 + uy * 30} ${tip.y - uy * 46 - ux * 30} Z`}
          fill={gold}
          stroke={gold}
          strokeWidth={6}
          strokeLinejoin="round"
        />
      </svg>
      <GrainOverlay />
    </AbsoluteFill>
  );
};
