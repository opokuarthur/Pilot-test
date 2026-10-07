// Render many stills of one composition with a single bundle (faster than
// one `remotion still` per frame). Writes out/previews/<comp>-f<frame>.png.
//   node scripts/render-stills.mjs <CompositionId> <frame> [<frame> ...]
// Optional env: SCALE (default 0.5), BROWSER (Chrome/Chromium executable).
import path from "node:path";
import fs from "node:fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const [comp, ...frames] = process.argv.slice(2);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const browserExecutable = process.env.BROWSER || null;
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable });
fs.mkdirSync(path.join(root, "out/previews"), { recursive: true });
for (const f of frames.map(Number)) {
  const output = path.join(root, `out/previews/${comp}-f${f}.png`);
  await renderStill({ serveUrl, composition, frame: f, output, scale: Number(process.env.SCALE || 0.5), browserExecutable });
  console.log(output);
}
