// Watermark: small "icon + LET’S UNFOLD" in the TOP-RIGHT corner, inside
// the safe area (BRAND.watermark.inset from the top and right edges), at
// BRAND.watermark.opacity. It fades in after BRAND.timing.watermarkDelay so
// it never competes with the hook. Never bottom-right: platform UI lives there.
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "./config";
import { BrandIcon, iconExtent } from "./BrandIcon";

export type WatermarkProps = {
  /** Frame it starts fading in (default: watermarkDelay seconds). */
  from?: number;
  /** Frame it fades out (e.g. where the sting starts). */
  until?: number;
  /** Wordmark text height in px. */
  fontSize?: number;
};

/** Width/height of the watermark block at the default size (for layout checks). */
export const WATERMARK_BOX = { width: 250, height: 50 };

/** Static watermark block (no timing): used by the video overlay and the PNG export. */
export const WatermarkMark: React.FC<{ fontSize?: number }> = ({ fontSize = 34 }) => {
  const icon = fontSize * 2;
  const e = iconExtent("half");
  const k = icon / 200;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: fontSize * 0.22 }}>
      {/* Trim the icon box to the visible paper. */}
      <div style={{ width: (e.x1 - e.x0) * k, height: (e.y1 - e.y0) * k, position: "relative", flex: "none" }}>
        <BrandIcon size={icon} variant="half" shadow={false} grain={0.6} style={{ position: "absolute", left: -e.x0 * k, top: -e.y0 * k }} />
      </div>
      <div
        style={{
          fontFamily: BRAND.fonts.headline,
          fontSize,
          lineHeight: 1,
          letterSpacing: fontSize * 0.04,
          color: BRAND.colors.cream,
          whiteSpace: "nowrap",
          textShadow: `0 ${fontSize * 0.05}px ${fontSize * 0.2}px rgba(0,0,0,0.55)`,
          paddingTop: fontSize * 0.08,
        }}
      >
        {BRAND.name}
      </div>
    </div>
  );
};

export const Watermark: React.FC<WatermarkProps> = ({ from, until, fontSize = 34 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = from ?? Math.round(BRAND.timing.watermarkDelay * fps);
  const fadeIn = interpolate(frame, [start, start + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = until === undefined ? 1 : interpolate(frame, [until - 6, until], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = fadeIn * fadeOut * BRAND.watermark.opacity;
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: BRAND.watermark.inset, right: BRAND.watermark.inset, opacity: o, pointerEvents: "none" }}>
      <WatermarkMark fontSize={fontSize} />
    </div>
  );
};
