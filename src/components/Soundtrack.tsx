// Soundtrack: the audio for a branded video (frame 0 = first frame).
//   • voiceover narration from 0 to `voice.mainEnd`
//   • the recorded sign-off (if any) moved to play over the end card
//   • a music bed: `underVoice` level during the video, swells for the logo
//     sting, dips under the sign-off, fades out at the very end
//   • a whoosh on every whip pan (pass the scene start frames)
// Levels/timings come from each video's audio config.
import React from "react";
import { Audio, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { stingFrames } from "../brand/LogoSting";

export type VoiceConfig = {
  file: string;
  /** Seconds of the file that are narration (played from frame 0). */
  mainEnd: number;
  /** Source range of the recorded sign-off, played from the end card's first frame. */
  signOff?: { from: number; to: number };
  volume: number;
};

export type MusicConfig = {
  file: string;
  underVoice: number;
  sting: number;
  endCard: number;
};

export type SoundtrackProps = {
  voice: VoiceConfig;
  music: MusicConfig;
  /** Length of the video itself (the outro starts here). */
  contentFrames: number;
  /** Frames where a whip-pan transition starts (scene starts after the first). */
  whooshAt?: number[];
  whoosh?: { file: string; volume: number };
  whipFrames?: number;
};

export const Soundtrack: React.FC<SoundtrackProps> = ({ voice, music, contentFrames, whooshAt = [], whoosh, whipFrames = 8 }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const endCardStart = contentFrames + stingFrames(fps);
  const signOffFrames = voice.signOff ? Math.round((voice.signOff.to - voice.signOff.from) * fps) : 0;

  const bedVolume = (f: number) =>
    interpolate(
      f,
      [0, 10, contentFrames - 10, contentFrames + 8, endCardStart - 4, endCardStart + 10, durationInFrames - 24, durationInFrames - 1],
      [music.underVoice * 0.6, music.underVoice, music.underVoice, music.sting, music.sting, music.endCard, music.endCard, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

  return (
    <>
      <Audio src={staticFile(music.file)} volume={bedVolume} />
      <Audio src={staticFile(voice.file)} durationInFrames={Math.round(voice.mainEnd * fps)} volume={voice.volume} />
      {voice.signOff ? (
        <Sequence from={endCardStart} durationInFrames={signOffFrames}>
          <Audio src={staticFile(voice.file)} trimBefore={Math.round(voice.signOff.from * fps)} durationInFrames={signOffFrames} volume={voice.volume} />
        </Sequence>
      ) : null}
      {whoosh
        ? whooshAt.map((at) => (
            <Sequence key={at} from={at + whipFrames / 2 - 9} durationInFrames={Math.round(0.6 * fps)}>
              <Audio src={staticFile(whoosh.file)} volume={whoosh.volume} />
            </Sequence>
          ))
        : null}
    </>
  );
};
