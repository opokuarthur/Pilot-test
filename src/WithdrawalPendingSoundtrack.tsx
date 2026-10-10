// Soundtrack for "Withdrawal Pending" (branded version): the voiceover, the
// recorded sign-off over the end card, the music bed and transition whooshes.
// Frame 0 = the first frame of the video. All levels live in config/voiceover.ts.
import React from "react";
import { Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { MUSIC, SFX, VOICEOVER } from "./config/voiceover";
import { SCENE_SECONDS, TOTAL_FRAMES, sceneStart } from "./config/timeline";
import { VIDEO } from "./config/video";
import { stingFrames } from "./brand/LogoSting";

export const WithdrawalPendingSoundtrack: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const sting = stingFrames(fps);
  const endCardStart = TOTAL_FRAMES + sting;
  const signOffFrames = Math.round((VOICEOVER.signOff.to - VOICEOVER.signOff.from) * fps);

  // Bed: soft under the voice, swells for the sting, dips under the sign-off, fades out.
  const bedVolume = (f: number) =>
    interpolate(
      f,
      [0, 10, TOTAL_FRAMES - 10, TOTAL_FRAMES + 8, endCardStart - 4, endCardStart + 10, durationInFrames - 24, durationInFrames - 1],
      [MUSIC.underVoice * 0.6, MUSIC.underVoice, MUSIC.underVoice, MUSIC.sting, MUSIC.sting, MUSIC.endCard, MUSIC.endCard, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

  return (
    <>
      <Audio src={staticFile(MUSIC.file)} volume={bedVolume} />
      <Audio src={staticFile(VOICEOVER.file)} durationInFrames={Math.round(VOICEOVER.mainEnd * fps)} volume={VOICEOVER.volume} />
      <Sequence from={endCardStart} durationInFrames={signOffFrames}>
        <Audio src={staticFile(VOICEOVER.file)} trimBefore={Math.round(VOICEOVER.signOff.from * fps)} durationInFrames={signOffFrames} volume={VOICEOVER.volume} />
      </Sequence>
      {/* Whoosh on every whip-pan (the pan runs over the first frames of each scene). */}
      {SCENE_SECONDS.slice(1).map(({ id }) => (
        <Sequence key={id} from={sceneStart(id) + VIDEO.whipFrames / 2 - 9} durationInFrames={Math.round(0.6 * fps)}>
          <Audio src={staticFile(SFX.whoosh)} volume={SFX.whooshVolume} />
        </Sequence>
      ))}
    </>
  );
};

/** End card timings that match the recorded sign-off. */
export const WITHDRAWAL_PENDING_END_CARD = {
  seconds: 5,
  lineAt: 4,
  followAt: Math.round(VOICEOVER.followOffset * VIDEO.fps) - 2,
};
