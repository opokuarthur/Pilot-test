// BrandedVideo: wraps a finished video with the channel branding.
//   • the video plays from frame 0 (nothing added at the start: hooks start instantly)
//   • the Watermark fades in after BRAND.timing.watermarkDelay and stays until the outro
//   • LogoSting + EndCard play right after the last frame of the video
// Register the composition with `brandedDuration(contentFrames, fps)`.
import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Watermark } from "./Watermark";
import { LogoSting, stingFrames } from "./LogoSting";
import { EndCard, endCardFrames } from "./EndCard";

/** Frames the outro adds (sting + end card). */
export const brandOutroFrames = (fps: number) => stingFrames(fps) + endCardFrames(fps);

/** Total composition length for a video of `contentFrames`. */
export const brandedDuration = (contentFrames: number, fps: number) => contentFrames + brandOutroFrames(fps);

export type BrandedVideoProps = {
  contentFrames: number;
  children: React.ReactNode;
  /** Show the watermark (false is only for layout checks). */
  watermark?: boolean;
};

export const BrandedVideo: React.FC<BrandedVideoProps> = ({ contentFrames, children, watermark = true }) => {
  const { fps } = useVideoConfig();
  const sting = stingFrames(fps);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={contentFrames} layout="none">
        <AbsoluteFill>{children}</AbsoluteFill>
        {watermark ? <Watermark until={contentFrames} /> : null}
      </Sequence>
      <Sequence from={contentFrames} durationInFrames={sting}>
        <LogoSting />
      </Sequence>
      <Sequence from={contentFrames + sting} durationInFrames={endCardFrames(fps)}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};
