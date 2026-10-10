// Scene order and lengths for "Withdrawal Pending". The frame maths lives in
// lib/timeline.ts (shared with the other videos).
import { VIDEO } from "./video";
import { SCRIPT } from "./script";
import { createTimeline } from "../lib/timeline";

export type SceneId = keyof typeof SCRIPT;

// Lengths follow the voiceover: each scene starts 0.35 s before its first
// spoken word (in exact frames at 30 fps, so nothing drifts), and the video
// cuts to black just after the final "pending" (137.2 s).
export const SCENE_SECONDS: { id: SceneId; seconds: number }[] = [
  { id: "coldOpen", seconds: 542 / 30 }, //   0:00.0–0:18.1
  { id: "yepbit", seconds: 663 / 30 }, //     0:18.1–0:40.2
  { id: "cwpc", seconds: 708 / 30 }, //       0:40.2–1:03.8
  { id: "list", seconds: 242 / 30 }, //       1:03.8–1:11.8
  { id: "twist", seconds: 771 / 30 }, //      1:11.8–1:37.5
  { id: "ponzi", seconds: 429 / 30 }, //      1:37.5–1:51.8
  { id: "redFlags", seconds: 761 / 30 }, //   1:51.8–2:17.2
];

const timeline = createTimeline(SCENE_SECONDS, SCRIPT, VIDEO.fps);

export const { sceneFrames, sceneStart, buildCaptions, sceneCaptions } = timeline;
export const TOTAL_FRAMES = timeline.totalFrames;
