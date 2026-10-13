// Re-render only the soundtrack of a video and swap it onto an existing
// render (for music/voice level changes: no need to re-render the picture).
//   node scripts/render-audio.mjs <CompositionId> <existing-video.mp4>
// Optional env: BROWSER (Chrome/Chromium executable).
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const [id, video] = process.argv.slice(2);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const browserExecutable = process.env.BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
const audio = path.join(root, `out/.${id}-audio.wav`);
await renderMedia({ serveUrl, composition, codec: "wav", outputLocation: audio, browserExecutable });
const tmp = video.replace(/\.mp4$/, ".new.mp4");
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", tmp]);
fs.renameSync(tmp, video);
fs.rmSync(audio);
console.log(`${video}: new soundtrack swapped in`);
