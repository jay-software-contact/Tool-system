import React, { createContext, useContext, ReactNode } from "react";

// ---- Token Types ----

export interface ThemeTokens {
  /** Background colors */
  bg: string;
  bgHover: string;
  bgActive: string;
  /** Text colors */
  text: string;
  textMuted: string;
  textDisabled: string;
  textActive: string;
  /** Border colors */
  border: string;
  /** Accent / interactive */
  accent: string;
  accentHover: string;
  /** Separator */
  separator: string;
  /** Loading shimmer base / highlight */
  shimmerBase: string;
  shimmerHighlight: string;
}

export interface ThemeContextValue {
  /** The resolved token set for the current theme */
  tokens: ThemeTokens;
  /** Theme identifier string */
  theme: string;
  /** Switch to a named theme */
  setTheme: (name: string) => void;
  /** Available theme names */
  availableThemes: string[];
}

// ---- Default Token Presets ----

export const themePresets: Record<string, ThemeTokens> = {
  "metal-heart": {
    bg: "#1a1a2e",
    bgHover: "#16213e",
    bgActive: "#0f3460",
    text: "#e0e0e0",
    textMuted: "#8a8a9a",
    textDisabled: "#4a4a5a",
    textActive: "#e6a817",
    border: "#2a2a3e",
    accent: "#e6a817",
    accentHover: "#f0b828",
    separator: "#3a3a4e",
    shimmerBase: "#1e1e32",
    shimmerHighlight: "#2a2a42",
  },
  "genx-soft-club": {
    bg: "#1a1520",
    bgHover: "#221a2e",
    bgActive: "#2e1f3e",
    text: "#d4c8e0",
    textMuted: "#8878a0",
    textDisabled: "#504060",
    textActive: "#7ec8e3",
    border: "#2e2240",
    accent: "#7ec8e3",
    accentHover: "#92d4ec",
    separator: "#3e2e50",
    shimmerBase: "#1e1728",
    shimmerHighlight: "#2a1f38",
  },
  grunge: {
    bg: "#1c1c1c",
    bgHover: "#2a2a2a",
    bgActive: "#333333",
    text: "#cccccc",
    textMuted: "#777777",
    textDisabled: "#444444",
    textActive: "#ff6b35",
    border: "#333333",
    accent: "#ff6b35",
    accentHover: "#ff7f4e",
    separator: "#444444",
    shimmerBase: "#222222",
    shimmerHighlight: "#2e2e2e",
  },
  corporate: {
    bg: "#f8f9fa",
    bgHover: "#e9ecef",
    bgActive: "#dee2e6",
    text: "#212529",
    textMuted: "#6c757d",
    textDisabled: "#adb5bd",
    textActive: "#0d6efd",
    border: "#ced4da",
    accent: "#0d6efd",
    accentHover: "#0b5ed7",
    separator: "#dee2e6",
    shimmerBase: "#e9ecef",
    shimmerHighlight: "#f3f4f6",
  },
};

// ---- Context ----

const ThemeContext = createContext<ThemeContextValue>({
  tokens: themePresets["metal-heart"],
  theme: "metal-heart",
  setTheme: () => {},
  availableThemes: Object.keys(themePresets),
});

// ---- Provider ----

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;
  customPresets?: Record<string, ThemeTokens>;
}

export function ThemeProvider({
  children,
  initialTheme = "metal-heart",
  customPresets,
}: ThemeProviderProps) {
  const [activeTheme, setActiveTheme] = React.useState(initialTheme);
  const allPresets = { ...themePresets, ...customPresets };
  const tokens = allPresets[activeTheme] ?? allPresets["metal-heart"];

  const value: ThemeContextValue = {
    tokens,
    theme: activeTheme,
    setTheme: setActiveTheme,
    availableThemes: Object.keys(allPresets),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ---- Hook ----

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

export default ThemeContext;
