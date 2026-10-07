// Export the LET’S UNFOLD brand files to out/brand/:
//   logo-full.png (2000 wide, transparent) + logo-full.svg
//   logo-square.png (1024², navy)          + logo-square.svg
//   logo-icon.png (1024², transparent)
//   watermark.png (transparent, 2× the in-video size)
//   youtube-banner.png (2560×1440)
//   logo-sting.mp4 (2 s, 1080×1920)
// PNGs/MP4 are rendered from the Brand-* compositions; SVGs are rendered from
// the same React components and their text is converted to outlines (Anton),
// so the files need no fonts installed.
//   node scripts/brand/export-brand.mjs        (optional env: BROWSER)
import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import opentype from "opentype.js";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const outDir = path.join(root, "out/brand");
fs.mkdirSync(outDir, { recursive: true });
const browserExecutable = process.env.BROWSER || null;

// ---- SVGs --------------------------------------------------------------------
const tmp = path.join(root, "out/.brand-svg.mjs");
await build({
  entryPoints: [path.join(root, "scripts/brand/svg-entry.tsx")],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: tmp,
  jsx: "automatic",
  logLevel: "error",
  // React's CommonJS server build can't be inlined into an ESM bundle: load it from node_modules.
  external: ["react", "react/*", "react-dom", "react-dom/*"],
  alias: {
    "@remotion/google-fonts/Anton": path.join(root, "scripts/brand/stubs/anton.mjs"),
    "@remotion/google-fonts/Inter": path.join(root, "scripts/brand/stubs/inter.mjs"),
  },
});
const { svgs } = await import(pathToFileURL(tmp).href);
fs.rmSync(tmp);

const anton = opentype.loadSync(path.join(root, "scripts/brand/anton-latin.woff"));
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const unescape = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'");

/** Replace <text data-outline="1"> elements with Anton outlines (same position, size, tracking, anchor). */
const outlineText = (svg) =>
  svg.replace(/<text([^>]*data-outline="1"[^>]*)>([^<]*)<\/text>/g, (_, attrs, raw) => {
    const text = unescape(raw);
    const size = Number(attr(attrs, "font-size"));
    const tracking = Number(attr(attrs, "letter-spacing") || 0);
    const x = Number(attr(attrs, "x") || 0);
    const y = Number(attr(attrs, "y") || 0);
    const anchor = attr(attrs, "text-anchor") || "start";
    const glyphs = anton.stringToGlyphs(text);
    const scale = size / anton.unitsPerEm;
    const width = glyphs.reduce((w, g) => w + g.advanceWidth * scale, 0) + tracking * (glyphs.length - 1);
    let cx = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
    let d = "";
    for (const g of glyphs) {
      d += g.getPath(cx, y, size).toPathData(2);
      cx += g.advanceWidth * scale + tracking;
    }
    return `<path d="${d}" fill="${attr(attrs, "fill")}"/>`;
  });

for (const [name, markup] of Object.entries(svgs)) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` + outlineText(markup).replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  if (svg.includes("<text")) throw new Error(`${name}: text left un-outlined`);
  fs.writeFileSync(path.join(outDir, name), svg);
  console.log(`out/brand/${name}`);
}

// ---- PNGs + sting ------------------------------------------------------------
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const stills = [
  ["Brand-LogoFull", "logo-full.png", 1],
  ["Brand-LogoSquare", "logo-square.png", 1],
  ["Brand-LogoIcon", "logo-icon.png", 1],
  ["Brand-Watermark", "watermark.png", 2],
  ["Brand-YouTubeBanner", "youtube-banner.png", 1],
];
for (const [id, file, scale] of stills) {
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  await renderStill({ serveUrl, composition, output: path.join(outDir, file), imageFormat: "png", scale, browserExecutable });
  console.log(`out/brand/${file}`);
}
const sting = await selectComposition({ serveUrl, id: "Brand-LogoSting", browserExecutable });
await renderMedia({ serveUrl, composition: sting, codec: "h264", crf: 18, outputLocation: path.join(outDir, "logo-sting.mp4"), browserExecutable });
console.log("out/brand/logo-sting.mp4");
