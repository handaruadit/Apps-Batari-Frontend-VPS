//===== (Imports) ======
import { Platform } from 'react-native';

//===== (Auth Style Constants) ======
export const AUTH_BACKGROUND_COLOR = '#0C1222';
export const AUTH_ACCENT_COLOR = '#18AEE6';
export const AUTH_FONT = Platform.select({
  android: 'sans-serif',
  ios: 'Helvetica Neue',
  default: 'System',
});
