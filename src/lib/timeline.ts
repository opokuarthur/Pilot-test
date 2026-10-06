// Timeline factory shared by every video in the project. Give it the scene
// order + lengths and the per-scene script; it returns frame helpers and the
// global caption track. Scene starts sit at fixed "nominal" times (matching
// the script); each scene except the last is rendered whip frames longer so
// the whip-pan overlap doesn't eat into the next scene's timing.
import type { CaptionChunk } from "../components/Captions";

export type ScriptLine = { at: number; text: string };

export const createTimeline = <Id extends string>(
  scenes: { id: Id; seconds: number }[],
  script: Record<Id, ScriptLine[]>,
  fps: number,
) => {
  const sceneFrames = (id: Id) => Math.round(scenes.find((s) => s.id === id)!.seconds * fps);

  /** Global start frame of each scene. */
  const sceneStart = (id: Id) => {
    let f = 0;
    for (const s of scenes) {
      if (s.id === id) return f;
      f += Math.round(s.seconds * fps);
    }
    throw new Error(`Unknown scene ${id}`);
  };

  const totalFrames = scenes.reduce((a, s) => a + Math.round(s.seconds * fps), 0);

  /** Converts the per-scene script into global caption chunks. */
  const buildCaptions = (gap = 4): CaptionChunk[] =>
    scenes.flatMap(({ id }) => {
      const start = sceneStart(id);
      const end = start + sceneFrames(id);
      const lines = script[id];
      return lines.map((l, i) => ({
        text: l.text,
        start: start + Math.round(l.at * fps),
        end: i < lines.length - 1 ? start + Math.round(lines[i + 1].at * fps) - gap : end - gap * 2,
      }));
    });

  /** Captions for one scene, re-based to start at 0 (for scene-only previews). */
  const sceneCaptions = (id: Id): CaptionChunk[] => {
    const off = sceneStart(id);
    return buildCaptions()
      .filter((c) => c.start >= off && c.start < off + sceneFrames(id))
      .map((c) => ({ ...c, start: c.start - off, end: c.end - off }));
  };

  return { scenes, sceneFrames, sceneStart, totalFrames, buildCaptions, sceneCaptions };
};
