// React context providing the active theme to all descendant components

import React, { createContext, useContext } from "react";
import type { Theme } from "./types.mjs";
import { defaultTheme } from "./theme.mjs";

const ThemeContext = createContext<Theme>(defaultTheme);

interface ThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
}

/** Provides the given theme to all descendant components */
export function ThemeProvider({ theme, children }: ThemeProviderProps): React.ReactElement {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Returns the active theme from the nearest ThemeProvider */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
