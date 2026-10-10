// Audio for "Withdrawal Pending": the ElevenLabs voiceover and the mix.
// Times are in seconds of the voiceover file, measured by forced alignment
// (scripts/voiceover/align.py → scripts/voiceover/withdrawal-pending.words.json).
export const VOICEOVER = {
  file: "audio/withdrawal-pending-vo.mp3",
  /** The narration plays from 0 through the last "pending" (silence follows). */
  mainEnd: 137.0,
  /**
   * The recorded sign-off ("That's how it unfolded. Follow @lets.unfold for
   * the next one."), moved to play over the end card.
   */
  signOff: { from: 137.55, to: 142.42 },
  /** Where "Follow…" starts inside the sign-off, in seconds from its start. */
  followOffset: 1.9,
  /** Gain: the raw file is about -21.8 LUFS; 1.6× brings it to about -17.5 LUFS. */
  volume: 1.6,
} as const;

export const MUSIC = {
  /** Original bed made by scripts/audio/make-sounds.py. */
  file: "audio/bed-soft-unfold.mp3",
  /** Under the voice (about 16 dB below it). */
  underVoice: 0.16,
  /** Swell during the logo sting. */
  sting: 0.34,
  /** Under the sign-off on the end card. */
  endCard: 0.2,
} as const;

export const SFX = {
  whoosh: "audio/whoosh.mp3",
  whooshVolume: 0.35,
} as const;
