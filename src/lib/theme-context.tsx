// ThemeProvider + useTheme: lets a whole video swap palette/fonts, while each
// component can still override individual values through its own props.
import React, { createContext, useContext } from "react";
import { defaultTheme, Theme, ThemeColors, ThemeFonts } from "../config/theme";

const ThemeContext = createContext<Theme>(defaultTheme);

export const ThemeProvider: React.FC<{ theme?: Partial<Theme>; children: React.ReactNode }> = ({
  theme,
  children,
}) => {
  const value: Theme = {
    colors: { ...defaultTheme.colors, ...theme?.colors },
    fonts: { ...defaultTheme.fonts, ...theme?.fonts },
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/** Props every themable component accepts. */
export type ThemableProps = {
  colors?: Partial<ThemeColors>;
  fonts?: Partial<ThemeFonts>;
};

/** Merge context theme with per-component overrides. */
export const useTheme = (overrides?: ThemableProps): Theme => {
  const base = useContext(ThemeContext);
  return {
    colors: { ...base.colors, ...overrides?.colors },
    fonts: { ...base.fonts, ...overrides?.fonts },
  };
};
