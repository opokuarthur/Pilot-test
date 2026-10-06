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
  jamestown: { file: "assets/rnaq/jamestown-lighthouse.jpg", credit: "Photo: [source]" },
  bugatti: { file: "assets/rnaq/rnaq-bugatti.jpg", credit: "Photo: [source]" },
  delay: { file: "assets/rnaq/delay-interview.png", credit: "Source: The Delay Show" },
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
