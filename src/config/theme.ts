// Visual identity: palette, fonts and motion presets.
// Every component reads its defaults from here (via useTheme), and any of them
// can be overridden per-instance with `colors` / `fonts` props, or for a whole
// video by wrapping it in <ThemeProvider>.
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

// loadFont() registers the font and blocks rendering (delayRender) until it's ready.
// latin-ext is needed for the cedi sign (₵).
const anton = loadAnton("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
const inter = loadInter("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin", "latin-ext"],
});

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

export type Theme = { colors: ThemeColors; fonts: ThemeFonts };

export const defaultTheme: Theme = {
  colors: {
    navy: "#14213D",
    gold: "#E9B44C",
    red: "#D62828",
    cream: "#F4EDE1",
    ink: "#0B1326",
    grey: "#8D8F94",
    up: "#3FA66B",
  },
  fonts: {
    headline: anton.fontFamily,
    body: inter.fontFamily,
  },
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
