// Safe areas for vertical social video (1080×1920).
// TikTok / Shorts overlay UI on the right edge and the bottom ~400px, so:
//   • important visuals live inside STAGE
//   • captions live inside CAPTION_ZONE (just above the platform UI)
//   • anything below CAPTION_ZONE is decoration only (floors, backgrounds)
export const SAFE = { top: 140, left: 100, right: 100, bottom: 420 } as const;

/** Where the main visuals go (y range). */
export const STAGE = { top: 150, bottom: 1290, left: 100, right: 980 } as const;

/** Captions block (y range). */
export const CAPTION_ZONE = { top: 1320, bottom: 1500 } as const;
