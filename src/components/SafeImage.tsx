// SafeImage: renders /public/assets/<file> if it exists, otherwise a clearly
// labelled placeholder (coloured rectangle + filename) so the composition
// always renders, even before the artwork is ready.
import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { assetUrl } from "../lib/assets";
import { useAssetExists } from "../lib/asset-context";
import { ThemableProps, useTheme } from "../lib/theme-context";

export type SafeImageProps = ThemableProps & {
  /** Path relative to /public/assets, e.g. "hand-phone.png". */
  file: string;
  /** How the image fills its box. "contain" suits transparent cutouts. */
  fit?: "cover" | "contain";
  /** Placeholder fill colour (defaults to a muted tone picked from the filename). */
  placeholderColor?: string;
  /** Extra hint shown under the filename on the placeholder. */
  placeholderHint?: string;
  style?: React.CSSProperties;
};

// Deterministic muted colour per filename so different placeholders are easy to tell apart.
const PLACEHOLDER_TONES = ["#2E4A7D", "#5B3F6B", "#2F6B5E", "#7A5230", "#6B2F3A", "#3D5A6B"];
const toneFor = (name: string) =>
  PLACEHOLDER_TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % PLACEHOLDER_TONES.length];

export const SafeImage: React.FC<SafeImageProps> = ({
  file,
  fit = "cover",
  placeholderColor,
  placeholderHint,
  style,
  ...themable
}) => {
  const exists = useAssetExists(file);
  const { colors, fonts } = useTheme(themable);

  if (exists) {
    return (
      <Img
        src={assetUrl(file)}
        style={{ width: "100%", height: "100%", objectFit: fit, ...style }}
      />
    );
  }

  const bg = placeholderColor ?? toneFor(file);
  return (
    <AbsoluteFill
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: bg,
        // Diagonal stripes make it obvious this is a stand-in, not final art.
        backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 24px, transparent 24px 48px)`,
        border: `6px dashed ${colors.cream}88`,
        boxSizing: "border-box",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 40,
        gap: 16,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: fonts.body,
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: 4,
          color: colors.ink,
          background: colors.gold,
          padding: "6px 16px",
          borderRadius: 6,
        }}
      >
        PLACEHOLDER
      </div>
      <div style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 44, color: colors.cream }}>
        {file}
      </div>
      {placeholderHint ? (
        <div style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: 28, color: `${colors.cream}cc` }}>
          {placeholderHint}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
