// Real photos used in "Five Thousand Plates" + their on-screen credits.
// Replace "[source]" with the photographer / outlet before publishing.
// Files live in public/; a scene only uses a photo if its file is actually
// there (see hasPhoto), otherwise it keeps the illustrated version.
import { getStaticFiles } from "remotion";

export const RNAQ_PHOTO = {
  file: "assets/rnaq/rnaq-cutout.png", // made by scripts/prepare-rnaq-cutout.py
  aspect: 1167 / 757,
  credit: "Photo: [source]",
} as const;

export const PHOTOS = {
  // 447×447 source, upscaled 2× (Lanczos + light sharpen; no faces in it).
  jamestown: { file: "assets/rnaq/jamestown-lighthouse.jpg", aspect: 1, credit: "Photo: [source]" },
  // 402×497 source, untouched (shown near native size so it stays sharp).
  bugatti: { file: "assets/rnaq/rnaq-bugatti.jpg", aspect: 402 / 497, credit: "Photo: [source]" },
  // Cropped to the two people (x 100–1050, y 0–482 of the 1125×902 upload):
  // removes an inset photo of an unrelated person.
  delay: { file: "assets/rnaq/delay-interview.png", aspect: 950 / 482, credit: "Source: The Delay Show" },
} as const;

/** True if `file` (path inside public/) exists in this bundle. */
export const hasPhoto = (file: string) => {
  const found = getStaticFiles().some((f) => f.name === file);
  if (!found && typeof window !== "undefined" && !(window as unknown as Record<string, boolean>)[`__warned_${file}`]) {
    (window as unknown as Record<string, boolean>)[`__warned_${file}`] = true;
    console.warn(`[FiveThousandPlates] ${file} not found in public/ — using the illustrated fallback.`);
  }
  return found;
};
