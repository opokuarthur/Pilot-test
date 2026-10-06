// "Five Thousand Plates": scene order and lengths (150 s total).
import { VIDEO } from "../config/video";
import { createTimeline } from "../lib/timeline";
import { PLATES_SCRIPT } from "./script";

export type PlatesSceneId = keyof typeof PLATES_SCRIPT;

export const PLATES_SCENES: { id: PlatesSceneId; seconds: number }[] = [
  { id: "hook", seconds: 12 }, //    0:00–0:12
  { id: "who", seconds: 23 }, //     0:12–0:35
  { id: "claim", seconds: 20 }, //   0:35–0:55
  { id: "math", seconds: 30 }, //    0:55–1:25
  { id: "defence", seconds: 25 }, // 1:25–1:50
  { id: "twist", seconds: 20 }, //   1:50–2:10
  { id: "verdict", seconds: 20 }, // 2:10–2:30
];

export const platesTimeline = createTimeline(PLATES_SCENES, PLATES_SCRIPT, VIDEO.fps);
export const PLATES_TOTAL_FRAMES = platesTimeline.totalFrames;
export const platesFrames = platesTimeline.sceneFrames;

/** Frames each scene component is actually on screen (its length + the outgoing whip). */
export const platesPushFrames = (id: PlatesSceneId) => platesFrames(id) + (id === "verdict" ? 0 : VIDEO.whipFrames);
