// Audio for "Ronaldo vs Jesus": the ElevenLabs voiceover and the music bed.
// Times are seconds of the voiceover file, from forced alignment
// (scripts/voiceover/ronaldo-vs-jesus.words.json). Both files are made by
// scripts/audio/prepare-ronaldo-audio.sh from the originals in public/audio/.
import type { MusicConfig, VoiceConfig } from "../components/Soundtrack";

export const RVJ_VOICE: VoiceConfig & { followOffset: number } = {
  /** Voice lifted ~4 dB through a limiter (-18.5 LUFS, timing unchanged). */
  file: "audio/ronaldo-vs-jesus-vo-mix.mp3",
  /** Narration ends after "Tell us in the comments." (139.19 s). */
  mainEnd: 139.3,
  /** "That's how it unfolded. Follow @lets.unfold for the next one." */
  signOff: { from: 139.35, to: 143.57 },
  /** Where "Follow…" starts inside the sign-off. */
  followOffset: 1.6,
  volume: 1,
};

export const RVJ_MUSIC: MusicConfig = {
  /** "The Mountain" (cinematic trailer), extended + compressed, normalised to -16 LUFS. */
  file: "audio/ronaldo-vs-jesus-music.mp3",
  /** About 10 dB under the voice: clearly audible (also on phone speakers), still behind it. */
  underVoice: 0.24,
  sting: 0.45,
  endCard: 0.26,
};
