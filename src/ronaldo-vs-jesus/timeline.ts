// "Ronaldo vs Jesus": scene order and lengths, following the voiceover: each
// scene starts 0.35 s before its first spoken word (exact frames at 30 fps), and
// the video cuts to black just after "Tell us in the comments." (140.6 s).
import { VIDEO } from "../config/video";
import { createTimeline } from "../lib/timeline";
import { RVJ_SCRIPT } from "./script";

export type RvjSceneId = keyof typeof RVJ_SCRIPT;

export const RVJ_SCENES: { id: RvjSceneId; seconds: number }[] = [
  { id: "hook", seconds: 305 / 30 }, //    0:00.0–0:10.2
  { id: "plan", seconds: 624 / 30 }, //    0:10.2–0:31.0
  { id: "norway", seconds: 570 / 30 }, //  0:31.0–0:50.0
  { id: "deal", seconds: 544 / 30 }, //    0:50.0–1:08.1
  { id: "press", seconds: 773 / 30 }, //   1:08.1–1:33.9
  { id: "twist", seconds: 615 / 30 }, //   1:33.9–1:54.4
  { id: "timing", seconds: 787 / 30 }, //  1:54.4–2:20.6
];

export const rvjTimeline = createTimeline(RVJ_SCENES, RVJ_SCRIPT, VIDEO.fps);
export const RVJ_TOTAL_FRAMES = rvjTimeline.totalFrames;
export const rvjFrames = rvjTimeline.sceneFrames;

/** Frames each scene component is actually on screen (its length + the outgoing whip). */
export const rvjPushFrames = (id: RvjSceneId) => rvjFrames(id) + (id === "timing" ? 0 : VIDEO.whipFrames);
