//===== (Imports) ======
import { Platform } from 'react-native';

//===== (Auth Theme Constants) ======
export const AUTH_BACKGROUND_COLOR = '#0C1222';
export const AUTH_CARD_BACKGROUND = 'rgba(255,255,255,0.06)';
export const AUTH_PRIMARY_NAVY = '#18AEE6';
export const AUTH_PRIMARY_NAVY_HOVER = '#149BD0';
export const AUTH_ACCENT_ORANGE = '#1877F2';
export const AUTH_ACCENT_BLUE = '#18AEE6';
export const AUTH_TEXT_MAIN = '#F8FAFC';
export const AUTH_TEXT_MUTED = 'rgba(255,255,255,0.65)';
export const AUTH_TEXT_LIGHT = 'rgba(255,255,255,0.40)';
export const AUTH_BORDER_COLOR = 'rgba(255,255,255,0.12)';
export const AUTH_BORDER_FOCUS = '#18AEE6';
export const AUTH_INPUT_BG = '#F8FAFC';

export const AUTH_FONT = Platform.select({
  android: 'sans-serif',
  ios: 'System',
  default: 'System',
});
