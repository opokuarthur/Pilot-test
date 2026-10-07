// Visual identity: palette, fonts and motion presets.
// Every component reads its defaults from here (via useTheme), and any of them
// can be overridden per-instance with `colors` / `fonts` props, or for a whole
// video by wrapping it in <ThemeProvider>.
import { continueRender, delayRender, staticFile } from "remotion";

// Fonts are self-hosted in public/fonts (the same Google Fonts files:
// Anton 400 and the Inter variable font, latin + latin-ext subsets), so
// renders never depend on reaching fonts.gstatic.com. Rendering waits
// (delayRender) until they're loaded. latin-ext is needed for the cedi sign (₵).
const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";

const FONT_FACES = [
  { family: "Anton", file: "fonts/anton-latin.woff2", weight: "400", unicodeRange: LATIN },
  { family: "Anton", file: "fonts/anton-latin-ext.woff2", weight: "400", unicodeRange: LATIN_EXT },
  { family: "Inter", file: "fonts/inter-latin.woff2", weight: "500 800", unicodeRange: LATIN },
  { family: "Inter", file: "fonts/inter-latin-ext.woff2", weight: "500 800", unicodeRange: LATIN_EXT },
];

if (typeof document !== "undefined") {
  const handle = delayRender("Loading fonts");
  Promise.all(
    FONT_FACES.map(({ family, file, weight, unicodeRange }) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, { weight, unicodeRange });
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error("Font loading failed", err);
      continueRender(handle);
    });
}

export type ThemeColors = {
  /** Backgrounds */
  navy: string;
  /** Money / hope */
  gold: string;
  /** Danger / pending */
  red: string;
  /** Text */
  cream: string;
  /** Darker navy for shadows, outlines, phone bezels */
  ink: string;
  /** Target colour for "failed" desaturation and disabled UI */
  grey: string;
  /** Rising candles / positive numbers (only used inside fake app UIs) */
  up: string;
};

export type ThemeFonts = {
  /** Headline / slam text */
  headline: string;
  /** Captions and UI text (use with fontWeight 700/800) */
  body: string;
};

export type Theme = {
  colors: ThemeColors;
  fonts: ThemeFonts;
  /** Warm skin tones used by the Person character system. */
  skinTones: string[];
  /** Clothing colours for generated characters (Crowd, PyramidCollapse). */
  outfitColors: string[];
};

export const defaultTheme: Theme = {
  colors: {
    navy: "#14213D",
    gold: "#E9B44C",
    red: "#D62828",
    cream: "#F4EDE1",
    ink: "#0B1326",
    grey: "#8A8F98",
    up: "#3FA66B",
  },
  fonts: {
    headline: "Anton",
    body: "Inter",
  },
  skinTones: ["#8D5524", "#A0662E", "#6B3E1F"],
  outfitColors: ["#E9B44C", "#D62828", "#F4EDE1", "#3E6FB0", "#2F7D5B", "#C8553D", "#7A4E9C"],
};

/** Spring presets shared by all components (see lib/motion.ts). */
export const springs = {
  /** Text slam: fast with a visible overshoot. */
  slam: { damping: 9, mass: 0.6, stiffness: 170 },
  /** UI pops (buttons, flags, icons): small overshoot. */
  pop: { damping: 12, mass: 0.5, stiffness: 200 },
  /** Smooth settle, no overshoot. */
  smooth: { damping: 200 },
} as const;
