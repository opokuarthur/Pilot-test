// Visual identity: palette, fonts and motion presets.
// Every component reads its defaults from here (via useTheme), and any of them
// can be overridden per-instance with `colors` / `fonts` props, or for a whole
// video by wrapping it in <ThemeProvider>.
// Brand palette and fonts come from the channel brand (src/brand/config.ts),
// which also loads the fonts via @remotion/google-fonts.
import { BRAND } from "../brand/config";

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
    navy: BRAND.colors.navy,
    gold: BRAND.colors.gold,
    red: BRAND.colors.red,
    cream: BRAND.colors.cream,
    ink: "#0B1326",
    grey: "#8A8F98",
    up: "#3FA66B",
  },
  fonts: {
    headline: BRAND.fonts.headline,
    body: BRAND.fonts.body,
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
