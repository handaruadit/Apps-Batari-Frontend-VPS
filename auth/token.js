/**
 * ============================================================
 * AUTH TOKEN HELPER (REFACTORED)
 * Mengelola JWT, session login, remember me, dan data user
 * menggunakan AsyncStorage.
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. STORAGE KEYS TERPUSAT
export const KEYS = {
  TOKEN: 'userToken',
  REMEMBER: 'rememberMe',
  USER: 'userInfo',
};

// 2. UTILS: GENERIC STORAGE HANDLER (Mencegah pengulangan try-catch)
const storage = {
  get: async (key, isJson = false) => {
    try {
      const val = await AsyncStorage.getItem(key);
      return isJson && val ? JSON.parse(val) : val;
    } catch { return null; }  
  },
  set: async (key, val) => {
    if (!val) return;
    try { await AsyncStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : String(val)); } catch {}
  },
  remove: (key) => AsyncStorage.removeItem(key).catch(() => {}),
};

// 3. PRIVATE HELPER: DECODE JWT LEBIH RINGKAS
const decodeBase64 = (encoded) => {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = padded + '='.repeat((4 - (padded.length % 4)) % 4);
    
    // Fallback dekripsi Base64
    return typeof atob === 'function' ? atob(normalized) 
         : global?.atob ? global.atob(normalized) 
         : globalThis?.Buffer ? globalThis.Buffer.from(normalized, 'base64').toString('utf-8') 
         : null;
  } catch { return null; }
};

// 4. JWT HELPERS
export const parseJwt = (token) => {
  try { return token ? JSON.parse(decodeBase64(token.split('.')[1])) : null; } catch { return null; }
};

export const isTokenValid = (token) => {
  const exp = parseJwt(token)?.exp;
  return exp ? exp * 1000 > Date.now() : false;
};

export const getUserFromToken = (token) => {
  const payload = parseJwt(token);
  if (!payload) return null;
  
  return {
    id: payload.id ?? payload.userId ?? payload.sub ?? null,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    role: payload.role ?? 'user',
  };
};

// 5. WRAPPER FUNGSI SPESIFIK (One-liners)
export const getToken = () => storage.get(KEYS.TOKEN);
export const saveToken = (token) => storage.set(KEYS.TOKEN, token);
export const removeToken = () => storage.remove(KEYS.TOKEN);

export const getUserInfo = () => storage.get(KEYS.USER, true);
export const saveUserInfo = (user) => storage.set(KEYS.USER, user);
export const removeUserInfo = () => storage.remove(KEYS.USER);

export const getRememberMe = () => storage.get(KEYS.REMEMBER);
export const setRememberMe = (remember) => remember ? storage.set(KEYS.REMEMBER, 'true') : storage.remove(KEYS.REMEMBER);
export const removeRememberMe = () => storage.remove(KEYS.REMEMBER);

// 6. AUTH SESSION LOGIC
export const clearAuth = () => AsyncStorage.multiRemove(Object.values(KEYS)).catch(() => {});

export const getValidRememberedToken = async () => {
  // Gunakan Promise.all agar I/O storage berjalan paralel (lebih cepat)
  const [token, rememberMe] = await Promise.all([getToken(), getRememberMe()]);

  if (token) {
    if (rememberMe === 'true' && isTokenValid(token)) {
      return token;
    }
    // Jika ada token tapi tidak remember me atau token expired, bersihkan
    await clearAuth();
  }
  
  return null;
};