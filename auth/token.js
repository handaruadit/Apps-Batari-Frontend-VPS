//===== (Imports) ======
import AsyncStorage from '@react-native-async-storage/async-storage';

//===== (Storage Keys) ======
export const KEYS = {
  TOKEN: 'userToken',
  REMEMBER: 'rememberMe',
  USER: 'userInfo',
};

//===== (storage) ======
const storage = {
  get: async (key, isJson = false) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return isJson && value ? JSON.parse(value) : value;
    } catch {
      return null;
    }
  },
  set: async (key, value) => {
    if (!value) return;

    try {
      await AsyncStorage.setItem(
        key,
        typeof value === 'object' ? JSON.stringify(value) : String(value),
      );
    } catch {
      // Storage failure is intentionally non-fatal for compatibility.
    }
  },
  remove: (key) => AsyncStorage.removeItem(key).catch(() => {}),
};

//===== (decodeBase64) ======
const decodeBase64 = (encoded) => {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = padded + '='.repeat((4 - (padded.length % 4)) % 4);

    if (typeof atob === 'function') return atob(normalized);
    if (global?.atob) return global.atob(normalized);
    if (globalThis?.Buffer) {
      return globalThis.Buffer.from(normalized, 'base64').toString('utf-8');
    }

    return null;
  } catch {
    return null;
  }
};

//===== (parseJwt) ======
export const parseJwt = (token) => {
  try {
    return token ? JSON.parse(decodeBase64(token.split('.')[1])) : null;
  } catch {
    return null;
  }
};

//===== (isTokenValid) ======
export const isTokenValid = (token) => {
  const exp = parseJwt(token)?.exp;
  return exp ? exp * 1000 > Date.now() : false;
};

//===== (getUserFromToken) ======
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

//===== (Token Storage) ======
export const getToken = () => storage.get(KEYS.TOKEN);
export const saveToken = (token) => storage.set(KEYS.TOKEN, token);
export const removeToken = () => storage.remove(KEYS.TOKEN);

//===== (User Storage) ======
export const getUserInfo = () => storage.get(KEYS.USER, true);
export const saveUserInfo = (user) => storage.set(KEYS.USER, user);
export const removeUserInfo = () => storage.remove(KEYS.USER);

//===== (Remember Me Storage) ======
export const getRememberMe = () => storage.get(KEYS.REMEMBER);
export const setRememberMe = (remember) =>
  remember ? storage.set(KEYS.REMEMBER, 'true') : storage.remove(KEYS.REMEMBER);
//===== (removeRememberMe) ======
export const removeRememberMe = () => storage.remove(KEYS.REMEMBER);

//===== (clearAuth) ======
export const clearAuth = () =>
  AsyncStorage.multiRemove(Object.values(KEYS)).catch(() => {});

//===== (getValidRememberedToken) ======
export const getValidRememberedToken = async () => {
  const [token, rememberMe] = await Promise.all([getToken(), getRememberMe()]);

  if (token) {
    if (rememberMe === 'true' && isTokenValid(token)) {
      return token;
    }

    await clearAuth();
  }

  return null;
};
