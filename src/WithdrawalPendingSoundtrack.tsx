// Soundtrack for "Withdrawal Pending" (branded version). All levels live in
// config/voiceover.ts; the mixing logic is the shared <Soundtrack>.
import React from "react";
import { MUSIC, SFX, VOICEOVER } from "./config/voiceover";
import { SCENE_SECONDS, TOTAL_FRAMES, sceneStart } from "./config/timeline";
import { VIDEO } from "./config/video";
import { Soundtrack } from "./components/Soundtrack";

export const WithdrawalPendingSoundtrack: React.FC = () => (
  <Soundtrack
    voice={VOICEOVER}
    music={MUSIC}
    contentFrames={TOTAL_FRAMES}
    whooshAt={SCENE_SECONDS.slice(1).map(({ id }) => sceneStart(id))}
    whoosh={{ file: SFX.whoosh, volume: SFX.whooshVolume }}
    whipFrames={VIDEO.whipFrames}
  />
);

/** End card timings that match the recorded sign-off. */
export const WITHDRAWAL_PENDING_END_CARD = {
  seconds: 5,
  lineAt: 4,
  followAt: Math.round(VOICEOVER.followOffset * VIDEO.fps) - 2,
};
