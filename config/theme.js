import { Platform } from "react-native";

export const appFont = Platform.select({
  android: "sans-serif",
  ios: "Helvetica Neue",
  default: "System",
});

export const appColors = {
  screen: "#020713",
  bubble: "#111827",
  bubbleBorder: "rgba(255,255,255,0.08)",
  text: "#F8FAFC",
  textSoft: "rgba(248,250,252,0.78)",
  textMuted: "rgba(248,250,252,0.58)",
  accent: "#08AEEA",
  input: "#0B1220",
  inputBorder: "rgba(255,255,255,0.12)",
};

export const lightColors = {
  screen: "#F7FBFF",
  bubble: "#FFFFFF",
  bubbleBorder: "rgba(8,174,234,0.34)",
  text: "#111827",
  textSoft: "rgba(17,24,39,0.78)",
  textMuted: "rgba(17,24,39,0.58)",
  accent: "#08AEEA",
  input: "#EEF9FF",
  inputBorder: "rgba(8,174,234,0.26)",
};

export const colorSchemes = {
  dark: appColors,
  light: lightColors,
};

export function getAppColors(themeMode = "dark") {
  return colorSchemes[themeMode] || colorSchemes.dark;
}
