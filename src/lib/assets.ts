// Asset registry + existence check.
// Remotion can't stat files while rendering a frame, so we check every expected
// file once (in calculateMetadata, before rendering starts) and pass the result
// down as an AssetManifest. <SafeImage> / <Sfx> then know whether to show the
// real file or a placeholder.
import { staticFile } from "remotion";

/** Every file the video knows about, relative to /public/assets. */
export const ASSETS = {
  handPhone: "hand-phone.png",
  groupCheering: "group-cheering.png",
  charYoungMan: "char-young-man.png",
  charChurchAuntie: "char-church-auntie.png",
  charOfficeWorker: "char-office-worker.png",
  charStudent: "char-student.png",
  crowdGoldOffice: "crowd-gold-office.png",
  queueRuralOffice: "queue-rural-office.png",
  voiceover: "voiceover.mp3",
  music: "music.mp3",
  timestamps: "timestamps.json",
} as const;

export const SFX = {
  tap: "sfx/tap.mp3",
  errorBuzz: "sfx/error-buzz.mp3",
  stampThud: "sfx/stamp-thud.mp3",
  glassCrack: "sfx/glass-crack.mp3",
  coins: "sfx/coins.mp3",
  whoosh: "sfx/whoosh.mp3",
} as const;

/** filename (relative to /public/assets) → exists? */
export type AssetManifest = Record<string, boolean>;

export const assetUrl = (file: string) => staticFile(`assets/${file}`);

const exists = async (file: string): Promise<boolean> => {
  try {
    const res = await fetch(assetUrl(file), { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
};

/** Check a list of files in parallel. */
export const checkAssets = async (
  files: readonly string[] = [...Object.values(ASSETS), ...Object.values(SFX)],
): Promise<AssetManifest> => {
  const results = await Promise.all(files.map(async (f) => [f, await exists(f)] as const));
  return Object.fromEntries(results);
};
