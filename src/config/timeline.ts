// Scene order and lengths for "Withdrawal Pending". The frame maths lives in
// lib/timeline.ts (shared with the other videos).
import { VIDEO } from "./video";
import { SCRIPT } from "./script";
import { createTimeline } from "../lib/timeline";

export type SceneId = keyof typeof SCRIPT;

export const SCENE_SECONDS: { id: SceneId; seconds: number }[] = [
  { id: "coldOpen", seconds: 15 },
  { id: "yepbit", seconds: 25 },
  { id: "cwpc", seconds: 25 },
  { id: "list", seconds: 10 },
  { id: "twist", seconds: 35 },
  { id: "ponzi", seconds: 25 },
  { id: "redFlags", seconds: 25 },
];

const timeline = createTimeline(SCENE_SECONDS, SCRIPT, VIDEO.fps);

export const { sceneFrames, sceneStart, buildCaptions, sceneCaptions } = timeline;
export const TOTAL_FRAMES = timeline.totalFrames;
