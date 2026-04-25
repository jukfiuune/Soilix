import { useColorScheme } from "react-native";

export const lightColors = {
  background: "#eefbf3",
  backgroundAlt: "#dff5ea",
  primary: "#2f8f46",
  primaryDark: "#1d6c32",
  accent: "#75bf66",
  sky: "#cfeefe",
  card: "#ffffff",
  cardAlt: "#f4faf6",
  text: "#16331f",
  textMuted: "#6c8772",
  border: "#d7e8dc",
  danger: "#c84e48",
  dangerSurface: "#fdeceb",
  warning: "#d98829",
  shadow: "rgba(20, 45, 27, 0.12)",
  tabBar: "#ffffff",
  inputBg: "#f9fcf9",
  overlay: "rgba(14, 24, 18, 0.45)",
  gradientStart: "#eefbf3",
  gradientEnd: "#e1f5fb",
};

export const darkColors: typeof lightColors = {
  background: "#0f1a12",
  backgroundAlt: "#162419",
  primary: "#3dab58",
  primaryDark: "#2f8f46",
  accent: "#5ea84f",
  sky: "#1a3040",
  card: "#1a2b1e",
  cardAlt: "#1f3324",
  text: "#e0f0e5",
  textMuted: "#7aab84",
  border: "#2c4535",
  danger: "#e06060",
  dangerSurface: "#3a1a1a",
  warning: "#e09c40",
  shadow: "rgba(0, 0, 0, 0.40)",
  tabBar: "#151f17",
  inputBg: "#1f2e23",
  overlay: "rgba(0, 0, 0, 0.60)",
  gradientStart: "#0f1a12",
  gradientEnd: "#0d1a20",
};

export type AppColors = typeof lightColors;

export function useAppColors(): AppColors {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkColors : lightColors;
}

// Keep the static light export for places that still need a non-hook reference
export const colors = lightColors;
