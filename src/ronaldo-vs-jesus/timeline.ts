// "Ronaldo vs Jesus": scene order and lengths (170 s total).
import { VIDEO } from "../config/video";
import { createTimeline } from "../lib/timeline";
import { RVJ_SCRIPT } from "./script";

export type RvjSceneId = keyof typeof RVJ_SCRIPT;

export const RVJ_SCENES: { id: RvjSceneId; seconds: number }[] = [
  { id: "hook", seconds: 15 }, //   0:00–0:15
  { id: "plan", seconds: 30 }, //   0:15–0:45
  { id: "norway", seconds: 25 }, // 0:45–1:10
  { id: "deal", seconds: 25 }, //   1:10–1:35
  { id: "press", seconds: 25 }, //  1:35–2:00
  { id: "twist", seconds: 20 }, //  2:00–2:20
  { id: "timing", seconds: 30 }, // 2:20–2:50
];

export const rvjTimeline = createTimeline(RVJ_SCENES, RVJ_SCRIPT, VIDEO.fps);
export const RVJ_TOTAL_FRAMES = rvjTimeline.totalFrames;
export const rvjFrames = rvjTimeline.sceneFrames;

/** Frames each scene component is actually on screen (its length + the outgoing whip). */
export const rvjPushFrames = (id: RvjSceneId) => rvjFrames(id) + (id === "timing" ? 0 : VIDEO.whipFrames);
