// GrainOverlay: subtle animated paper-grain texture, drawn with SVG noise
// (feTurbulence), so no texture file is needed. Two layers:
//   1. a static, low-frequency "paper fibre" mottle
//   2. fine grain whose noise seed changes every few frames (film-style flicker)
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export type GrainOverlayProps = {
  /** Overall strength, 0–1. */
  opacity?: number;
  /** Change the fine-grain pattern every N frames (2 ≈ 15 updates/sec at 30fps). */
  updateEvery?: number;
  /** Fine grain frequency; higher = finer. */
  grainFrequency?: number;
  /** Grain pixel size; noise is generated at 1/scale resolution and scaled up. */
  scale?: number;
  /** Strength of the paper-fibre layer, 0–1 (relative to `opacity`). */
  paper?: number;
  /** Noise contrast multiplier; higher = punchier specks. */
  contrast?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
};

const NoiseLayer: React.FC<{
  id: string;
  seed: number;
  baseFrequency: string;
  octaves: number;
  width: number;
  height: number;
  scale: number;
  opacity: number;
  contrast: number;
}> = ({ id, seed, baseFrequency, octaves, width, height, scale, opacity, contrast }) => (
  <svg
    width={width / scale}
    height={height / scale}
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      transform: `scale(${scale})`,
      transformOrigin: "0 0",
      opacity,
    }}
  >
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency={baseFrequency} numOctaves={octaves} seed={seed} stitchTiles="stitch" />
      {/* Greyscale + push alpha to fully opaque so the blend mode does the work. */}
      <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1" />
      {/* Stretch contrast: raw fractal noise hovers around mid-grey, which overlay-blends to almost nothing. */}
      <feComponentTransfer>
        <feFuncR type="linear" slope={contrast} intercept={0.5 - contrast / 2} />
        <feFuncG type="linear" slope={contrast} intercept={0.5 - contrast / 2} />
        <feFuncB type="linear" slope={contrast} intercept={0.5 - contrast / 2} />
      </feComponentTransfer>
    </filter>
    <rect width="100%" height="100%" filter={`url(#${id})`} />
  </svg>
);

export const GrainOverlay: React.FC<GrainOverlayProps> = ({
  opacity = 0.24,
  updateEvery = 2,
  grainFrequency = 0.85,
  scale = 1.5,
  paper = 0.6,
  contrast = 3,
  blendMode = "overlay",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // Unique-per-instance SVG ids (React's useId contains characters url(#…) dislikes).
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const seed = Math.floor(frame / updateEvery) % 97;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: blendMode, opacity }}>
      <NoiseLayer
        id={`paper${uid}`}
        seed={7}
        baseFrequency="0.012 0.05"
        octaves={4}
        width={width}
        height={height}
        scale={2}
        opacity={paper}
        contrast={contrast * 0.8}
      />
      <NoiseLayer
        id={`grain${uid}`}
        seed={seed}
        baseFrequency={String(grainFrequency)}
        octaves={2}
        width={width}
        height={height}
        scale={scale}
        opacity={1}
        contrast={contrast}
      />
    </AbsoluteFill>
  );
};
