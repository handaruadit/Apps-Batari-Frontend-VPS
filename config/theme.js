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
