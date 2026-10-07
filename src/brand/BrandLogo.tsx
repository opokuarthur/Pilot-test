// BrandLogo: the LET’S UNFOLD logo as one self-contained SVG.
//   "full"     — half-open BrandIcon to the left of the stacked wordmark
//   "wordmark" — just "LET’S" (small) over "UNFOLD" (large), gold crease under UNFOLD
//   "icon"     — just the BrandIcon
//   "square"   — BrandIcon with a gold "U", centred on navy (profile picture)
// Size it with `width` or `height` (the other follows the logo's ratio;
// "square"/"icon" use `size`). All text, colours and fonts come from
// BRAND. No Remotion hooks: it also renders statically for the exports.
import React from "react";
import { BRAND } from "./config";
import { BrandIcon, BrandIconProps, iconExtent } from "./BrandIcon";
import { ANTON_CAP, antonWidth } from "./metrics";

export type BrandLogoVariant = "full" | "wordmark" | "icon" | "square";

export type BrandLogoProps = {
  variant?: BrandLogoVariant;
  width?: number;
  height?: number;
  /** Square / icon size in px. */
  size?: number;
  /** Wordmark colour (default cream) and accent (default gold). */
  color?: string;
  accent?: string;
  /** Icon options (variant, U, crease glow…). */
  icon?: Omit<BrandIconProps, "size">;
  style?: React.CSSProperties;
};

// Wordmark layout in units where UNFOLD's font size = 100.
const BIG = 100;
const SMALL = 47;
const BIG_TRACK = 2;
const SMALL_TRACK = 6.5;
const GAP = 9;
const RULE_GAP = 10;
const RULE_H = 3.6;

export const wordmarkLayout = () => {
  const { top, bottom } = BRAND.wordmark;
  const topW = antonWidth(top, SMALL, SMALL_TRACK);
  const bottomW = antonWidth(bottom, BIG, BIG_TRACK);
  const topBase = SMALL * ANTON_CAP;
  const bottomBase = topBase + GAP + BIG * ANTON_CAP;
  const ruleY = bottomBase + RULE_GAP;
  return { topW, bottomW, width: Math.max(topW, bottomW), height: ruleY + RULE_H, topBase, bottomBase, ruleY };
};

/** The stacked wordmark as SVG elements, origin top-left, in wordmark units. */
const Wordmark: React.FC<{ color: string; accent: string }> = ({ color, accent }) => {
  const L = wordmarkLayout();
  const text = (s: string, y: number, size: number, track: number) => (
    <text data-outline="1" x={0} y={y} fontFamily={BRAND.fonts.headline} fontSize={size} letterSpacing={track} fill={color}>
      {s}
    </text>
  );
  return (
    <g>
      {text(BRAND.wordmark.top, L.topBase, SMALL, SMALL_TRACK)}
      {text(BRAND.wordmark.bottom, L.bottomBase, BIG, BIG_TRACK)}
      {/* Thin gold crease under UNFOLD */}
      <rect x={0} y={L.ruleY} width={L.bottomW - BIG_TRACK} height={RULE_H} rx={RULE_H / 2} fill={accent} />
    </g>
  );
};

/** Layout of the "full" logo (icon + wordmark) in wordmark units. */
export const fullLayout = () => {
  const L = wordmarkLayout();
  // Visible extent of the half-open icon inside its 200-unit box.
  const ICON_VIS = iconExtent("half");
  const visH = L.height * 1.12;
  const iconBox = (visH / (ICON_VIS.y1 - ICON_VIS.y0)) * 200;
  const k = iconBox / 200;
  const iconVisW = (ICON_VIS.x1 - ICON_VIS.x0) * k;
  const gap = L.height * 0.2;
  const pad = 6;
  const wordX = iconVisW + gap;
  return {
    L,
    iconBox,
    iconX: -ICON_VIS.x0 * k,
    iconY: (L.height - visH) / 2 - ICON_VIS.y0 * k,
    wordX,
    vbX: -pad,
    vbY: (L.height - visH) / 2 - pad,
    vbW: wordX + L.width + pad * 2,
    vbH: visH + pad * 2,
  };
};

/** Width ÷ height of the "full" logo. */
export const fullLogoAspect = () => {
  const F = fullLayout();
  return F.vbW / F.vbH;
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = "full", width, height, size, color, accent, icon, style }) => {
  const fill = color ?? BRAND.colors.cream;
  const gold = accent ?? BRAND.colors.gold;

  if (variant === "icon") {
    return <BrandIcon size={size ?? width ?? height ?? 200} variant="half" {...icon} style={style} />;
  }

  if (variant === "square") {
    const s = size ?? width ?? height ?? 1024;
    return (
      <svg width={s} height={s} viewBox="0 0 200 200" style={style}>
        <rect width={200} height={200} fill={BRAND.colors.navy} />
        {/* Soft gold glow behind the paper */}
        <defs>
          <radialGradient id="squareGlow" cx="0.5" cy="0.52" r="0.5">
            <stop offset="0" stopColor={gold} stopOpacity={0.22} />
            <stop offset="1" stopColor={gold} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={200} height={200} fill="url(#squareGlow)" />
        {/* Icon box scaled so the paper fills ~66% of the square, optically centred */}
        <svg x={-18} y={-23} width={236} height={236} viewBox="0 0 200 200" overflow="visible">
          <BrandIcon size={200} variant="half" showU {...icon} />
        </svg>
      </svg>
    );
  }

  const L = wordmarkLayout();
  if (variant === "wordmark") {
    const pad = 4;
    const vbW = L.width + pad * 2;
    const vbH = L.height + pad * 2;
    const w = width ?? (height ? (height * vbW) / vbH : 600);
    return (
      <svg width={w} height={(w * vbH) / vbW} viewBox={`${-pad} ${-pad} ${vbW} ${vbH}`} style={{ overflow: "visible", ...style }}>
        <Wordmark color={fill} accent={gold} />
      </svg>
    );
  }

  // Full: icon left, wordmark right, both vertically centred.
  const F = fullLayout();
  const w = width ?? (height ? (height * F.vbW) / F.vbH : 900);
  return (
    <svg width={w} height={(w * F.vbH) / F.vbW} viewBox={`${F.vbX} ${F.vbY} ${F.vbW} ${F.vbH}`} style={{ overflow: "visible", ...style }}>
      <svg x={F.iconX} y={F.iconY} width={F.iconBox} height={F.iconBox} viewBox="0 0 200 200" overflow="visible">
        <BrandIcon size={200} variant="half" {...icon} />
      </svg>
      <g transform={`translate(${F.wordX} 0)`}>
        <Wordmark color={fill} accent={gold} />
      </g>
    </svg>
  );
};
