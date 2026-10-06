// Step 1 check: SceneFrame (push-in + vignette + grain), a SafeImage
// placeholder, both fonts, and the palette.
import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { SafeImage } from "../components/SafeImage";
import { useTheme } from "../lib/theme-context";
import { ASSETS } from "../lib/assets";

export const FoundationPreview: React.FC = () => {
  const { colors, fonts } = useTheme();
  const swatches = [colors.navy, colors.gold, colors.red, colors.cream];
  return (
    <SceneFrame>
      <AbsoluteFill style={{ padding: 80, gap: 40, alignItems: "center" }}>
        <div
          style={{
            fontFamily: fonts.headline,
            fontSize: 150,
            lineHeight: 0.95,
            color: colors.cream,
            textAlign: "center",
            marginTop: 60,
          }}
        >
          WITHDRAWAL <span style={{ color: colors.red }}>PENDING</span>
        </div>
        <div style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 52, color: colors.gold }}>
          Ghana's Ponzi Problem · GH₵ 2,000.00
        </div>
        <div style={{ width: 760, height: 900, borderRadius: 24, overflow: "hidden" }}>
          <SafeImage file={ASSETS.handPhone} placeholderHint="hand holding phone, blank screen" />
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {swatches.map((c) => (
            <div key={c} style={{ width: 150, height: 150, borderRadius: 16, background: c, border: `3px solid ${colors.cream}` }} />
          ))}
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
