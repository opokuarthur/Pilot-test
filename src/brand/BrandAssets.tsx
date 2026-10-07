// Brand asset compositions: each renders one exportable file (see
// scripts/brand/export-brand.mjs). Transparent ones paint no background.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { BRAND } from "./config";
import { BrandLogo, fullLogoAspect } from "./BrandLogo";
import { BrandIcon, iconExtent } from "./BrandIcon";
import { WatermarkMark, WATERMARK_BOX } from "./Watermark";
import { GrainOverlay } from "../components/GrainOverlay";

export const ASSET_SIZES = {
  logoFull: { width: 2000, height: Math.round(2000 / fullLogoAspect()) },
  logoSquare: { width: 1024, height: 1024 },
  logoIcon: { width: 1024, height: 1024 },
  // The in-video watermark block plus a little room for its text shadow.
  watermark: { width: WATERMARK_BOX.width + 24, height: WATERMARK_BOX.height + 24 },
  youtubeBanner: { width: 2560, height: 1440 },
};

/** Full logo on transparent. */
export const LogoFullAsset: React.FC = () => {
  const { width } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <BrandLogo variant="full" width={width} />
    </AbsoluteFill>
  );
};

/** Square profile picture: icon with a gold U on navy. */
export const LogoSquareAsset: React.FC = () => {
  const { width } = useVideoConfig();
  return <BrandLogo variant="square" size={width} />;
};

/** Icon alone on transparent (paper fills the frame with a small margin). */
export const LogoIconAsset: React.FC = () => {
  const { width } = useVideoConfig();
  // Scale the icon box so the visible paper spans ~88% of the frame, centred.
  const e = iconExtent("half");
  const box = (width * 0.88 * 200) / Math.max(e.x1 - e.x0, e.y1 - e.y0);
  const k = box / 200;
  const dx = (100 - (e.x0 + e.x1) / 2) * k;
  const dy = (100 - (e.y0 + e.y1) / 2) * k;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: box, height: box, flex: "none", transform: `translate(${dx}px, ${dy}px)` }}>
        <BrandIcon size={box} variant="half" />
      </div>
    </AbsoluteFill>
  );
};

/** The watermark block, exactly as it appears in videos (full opacity: set opacity in your editor). */
export const WatermarkAsset: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <WatermarkMark />
  </AbsoluteFill>
);

/** YouTube channel banner (2560×1440). Logo + tagline sit inside the 1546×423 safe area. */
export const YouTubeBanner: React.FC = () => {
  const { width, height } = useVideoConfig();
  const safe = { w: 1546, h: 423 };
  const { navy, gold, cream } = BRAND.colors;
  return (
    <AbsoluteFill style={{ background: navy, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 45% 40% at 50% 50%, ${gold}2E 0%, transparent 70%)` }} />
      {/* Faint creases across the whole banner, like a sheet folded in thirds */}
      {[1 / 3, 2 / 3].map((f) => (
        <div key={f} style={{ position: "absolute", left: 0, right: 0, top: height * f, height: 3, background: `${gold}30` }} />
      ))}
      <div
        style={{
          position: "absolute",
          left: (width - safe.w) / 2,
          top: (height - safe.h) / 2,
          width: safe.w,
          height: safe.h,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 34,
        }}
      >
        <BrandLogo variant="full" height={250} />
        <div style={{ fontFamily: BRAND.fonts.body, fontWeight: 700, fontSize: 54, color: cream, letterSpacing: 0.5, whiteSpace: "nowrap" }}>{BRAND.tagline}</div>
      </div>
      <GrainOverlay opacity={0.18} />
    </AbsoluteFill>
  );
};

/** Preview: every variant on one canvas, plus the safe-area box on the banner. */
export const BrandSheetPreview: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.navy, padding: 60, gap: 50, display: "flex", flexDirection: "column", alignItems: "center" }}>
    <BrandLogo variant="full" width={900} />
    <BrandLogo variant="wordmark" width={500} />
    <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
      <BrandIcon size={260} variant="closed" showU />
      <BrandIcon size={260} variant="half" />
      <BrandIcon size={260} variant="open" showU />
    </div>
    <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
      <BrandLogo variant="square" size={300} />
      <div style={{ background: BRAND.colors.cream, padding: 24, borderRadius: 16 }}>
        <BrandLogo variant="full" width={460} color={BRAND.colors.navy} />
      </div>
    </div>
    <WatermarkMark />
  </AbsoluteFill>
);
