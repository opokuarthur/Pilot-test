// Silhouettes: the two recurring (real-person) characters, always drawn as
// solid faceless silhouettes built on Person. Never caricatures: no faces,
// no features, only a shirt number or a suit collar to tell them apart.
//   <Player/>  dark silhouette with a red rim light and a "7" on the shirt;
//              `bib` adds a training bib (warm-ups).
//   <Coach/>   darker silhouette in a suit: cream shirt V + tie at the neck.
// Both accept every Person prop (x, y, height, pose, walk, flip, view…).
// `playerLook()` / `coachLook()` return the PersonFigure props for use
// inside a larger <svg> (e.g. <PersonFigure {...playerLook(colors)} />).
import React from "react";
import { Person, PersonFigureProps, PersonProps } from "./Person";
import { alpha } from "../lib/color";
import { ThemeColors, defaultTheme } from "../config/theme";
import { useTheme } from "../lib/theme-context";

/** Shirt number (and optional bib) in torso units (torso spans x 42–158, y 165–300). */
const ShirtNumber: React.FC<{ number: string; bib: boolean; colors: ThemeColors; font: string }> = ({ number, bib, colors, font }) => (
  <g>
    {bib ? (
      <path
        d="M66,176 Q100,196 134,176 L150,202 L146,296 Q100,306 54,296 L50,202 Z"
        fill={colors.gold}
        stroke={alpha(colors.ink, 0.5)}
        strokeWidth={3}
      />
    ) : null}
    <text
      x={100}
      y={276}
      textAnchor="middle"
      fontFamily={font}
      fontSize={84}
      fill={bib ? colors.ink : colors.red}
      stroke={bib ? "none" : colors.cream}
      strokeWidth={bib ? 0 : 3}
      paintOrder="stroke fill"
    >
      {number}
    </text>
  </g>
);

/** Suit hint: shirt V and tie at the neck. */
const SuitCollar: React.FC<{ colors: ThemeColors }> = ({ colors }) => (
  <g>
    <path d="M82,168 L100,212 L118,168 Q100,172 82,168 Z" fill={alpha(colors.cream, 0.92)} />
    <path d="M100,180 L106,190 L103,214 L100,220 L97,214 L94,190 Z" fill={colors.ink} />
    {/* Lapels */}
    <path d="M78,170 L100,222 L90,226 L68,178 Z M122,170 L100,222 L110,226 L132,178 Z" fill={alpha(colors.grey, 0.45)} />
  </g>
);

export type PlayerLookOptions = { number?: string; bib?: boolean; rim?: string; fill?: string };

export const playerLook = (
  colors: ThemeColors = defaultTheme.colors,
  font: string = defaultTheme.fonts.headline,
  { number = "7", bib = false, rim, fill }: PlayerLookOptions = {},
): PersonFigureProps => ({
  silhouette: fill ?? colors.ink,
  rimLight: rim ?? alpha(colors.red, 0.95),
  hair: "fade",
  outfit: "tshirt",
  torsoOverlay: <ShirtNumber number={number} bib={bib} colors={colors} font={font} />,
});

export const coachLook = (colors: ThemeColors = defaultTheme.colors, { rim, fill }: { rim?: string; fill?: string } = {}): PersonFigureProps => ({
  silhouette: fill ?? "#060A15",
  rimLight: rim ?? alpha(colors.cream, 0.75),
  hair: "short",
  outfit: "shirtTie",
  torsoOverlay: <SuitCollar colors={colors} />,
});

export const Player: React.FC<PersonProps & PlayerLookOptions> = ({ number, bib, rim, fill, ...rest }) => {
  const { colors, fonts } = useTheme(rest);
  return <Person {...playerLook(colors, fonts.headline, { number, bib, rim, fill })} {...rest} />;
};

export const Coach: React.FC<PersonProps & { rim?: string; fill?: string }> = ({ rim, fill, ...rest }) => {
  const { colors } = useTheme(rest);
  return <Person {...coachLook(colors, { rim, fill })} {...rest} />;
};
