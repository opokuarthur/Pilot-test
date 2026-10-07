// LET’S UNFOLD — the channel's brand, in one place.
// Every brand component (BrandIcon, BrandLogo, Watermark, LogoSting,
// EndCard), the brand exports and the shared video theme (config/theme.ts)
// read from here, so changing a value here changes it everywhere.
//
// Concept: a folded sheet of paper that opens to reveal the story, like
// opening a case file. Every video unfolds a story.
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

// loadFont() registers the font and blocks rendering (delayRender) until it's
// ready. latin-ext is needed for the cedi sign (₵) used in one video.
const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
const inter = loadInter("normal", { weights: ["500", "700", "800"], subsets: ["latin", "latin-ext"] });

/** Typographic apostrophe: always ’ (U+2019), never a straight ' in brand text. */
export const APOSTROPHE = "’";

const name = `LET${APOSTROPHE}S UNFOLD`;
const handle = "@lets.unfold";

export const BRAND = {
  /** Channel name as set in the wordmark. */
  name,
  /** Display name for profiles and titles. */
  displayName: `Let${APOSTROPHE}s Unfold`,
  handle,
  /** The two stacked wordmark lines ("LET’S" over "UNFOLD"). */
  wordmark: { top: `LET${APOSTROPHE}S`, bottom: "UNFOLD" },
  catchphrase: {
    /** Said when a story starts. */
    open: `Let${APOSTROPHE}s unfold it.`,
    /** Said / shown at the end of every video. */
    close: `That${APOSTROPHE}s how it unfolded.`,
  },
  tagline: "The full story behind the headlines.",
  /** End-card call to action. */
  follow: `Follow ${handle} for the next one`,
  /** The initial on the icon's front panel. */
  initial: "U",
  colors: {
    navy: "#14213D",
    gold: "#E9B44C",
    cream: "#F4EDE1",
    /** Accent only. */
    red: "#D62828",
  },
  fonts: {
    /** Wordmark and headlines. */
    headline: anton.fontFamily,
    /** Small text. */
    body: inter.fontFamily,
  },
  /** Brand timings, in seconds. */
  timing: {
    /** Watermark fades in after this, so it never competes with the hook. */
    watermarkDelay: 1.5,
    sting: 2,
    endCard: 3,
  },
  watermark: {
    /** Distance from the top and right edges, px (1080×1920 frame). */
    inset: 60,
    opacity: 0.6,
  },
} as const;

export type Brand = typeof BRAND;
export type BrandColors = Brand["colors"];
