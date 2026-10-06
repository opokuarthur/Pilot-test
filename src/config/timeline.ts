// Scene order and lengths. Scene starts are at fixed "nominal" times
// (matching the script); each scene except the last is rendered WHIP frames
// longer so the whip-pan overlap doesn't eat into the next scene's timing.
import { VIDEO } from "./video";
import { SCRIPT } from "./script";
import type { CaptionChunk } from "../components/Captions";

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

export const sceneFrames = (id: SceneId) => Math.round(SCENE_SECONDS.find((s) => s.id === id)!.seconds * VIDEO.fps);

/** Global start frame of each scene. */
export const sceneStart = (id: SceneId) => {
  let f = 0;
  for (const s of SCENE_SECONDS) {
    if (s.id === id) return f;
    f += Math.round(s.seconds * VIDEO.fps);
  }
  throw new Error(`Unknown scene ${id}`);
};

export const TOTAL_FRAMES = SCENE_SECONDS.reduce((a, s) => a + Math.round(s.seconds * VIDEO.fps), 0);

/** Converts the per-scene script into global caption chunks. */
export const buildCaptions = (gap = 4): CaptionChunk[] =>
  SCENE_SECONDS.flatMap(({ id }) => {
    const start = sceneStart(id);
    const end = start + sceneFrames(id);
    const lines = SCRIPT[id];
    return lines.map((l, i) => ({
      text: l.text,
      start: start + Math.round(l.at * VIDEO.fps),
      end: i < lines.length - 1 ? start + Math.round(lines[i + 1].at * VIDEO.fps) - gap : end - gap * 2,
    }));
  });

/** Captions for one scene, re-based to start at 0 (for scene-only previews). */
export const sceneCaptions = (id: SceneId): CaptionChunk[] => {
  const off = sceneStart(id);
  return buildCaptions()
    .filter((c) => c.start >= off && c.start < off + sceneFrames(id))
    .map((c) => ({ ...c, start: c.start - off, end: c.end - off }));
};
