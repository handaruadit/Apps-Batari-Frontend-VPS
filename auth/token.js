import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_KEY = 'userToken';
export const REMEMBER_KEY = 'rememberMe';
export const USER_INFO_KEY = 'userInfo';

const normalizeBase64 = (base64) => {
  const padded = base64.replace(/-/g, '+').replace(/_/g, '/');
  return padded + '='.repeat((4 - (padded.length % 4)) % 4);
};

const decodeBase64 = (encoded) => {
  try {
    const normalized = normalizeBase64(encoded);

    if (typeof global?.atob === 'function') {
      return global.atob(normalized);
    }

    if (typeof atob === 'function') {
      return atob(normalized);
    }

    if (typeof Buffer !== 'undefined') {
      return Buffer.from(normalized, 'base64').toString('utf-8');
    }

    return null;
  } catch {
    return null;
  }
};

export const parseJwt = (token) => {
  if (!token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const payload = decodeBase64(parts[1]);
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

export const isTokenValid = (token) => {
  const payload = parseJwt(token);
  if (!payload || typeof payload.exp !== 'number') {
    return false;
  }

  return payload.exp * 1000 > Date.now();
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const saveToken = async (token) => {
  if (!token) {
    return;
  }
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const removeRememberMe = async () => {
  await AsyncStorage.removeItem(REMEMBER_KEY);
};

export const saveUserInfo = async (userInfo) => {
  if (!userInfo) {
    return;
  }

  try {
    await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  } catch {
    // ignore
  }
};

export const getUserInfo = async () => {
  try {
    const item = await AsyncStorage.getItem(USER_INFO_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

export const removeUserInfo = async () => {
  await AsyncStorage.removeItem(USER_INFO_KEY);
};

export const getUserFromToken = (token) => {
  const payload = parseJwt(token);
  if (!payload) {
    return null;
  }

  return {
    email: payload.email ?? null,
    phone: payload.phone ?? null,
  };
};

export const getRememberMe = async () => {
  try {
    return await AsyncStorage.getItem(REMEMBER_KEY);
  } catch {
    return null;
  }
};

export const setRememberMe = async (remember) => {
  if (remember) {
    await AsyncStorage.setItem(REMEMBER_KEY, 'true');
  } else {
    await AsyncStorage.removeItem(REMEMBER_KEY);
  }
};

export const clearAuth = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(REMEMBER_KEY);
  await AsyncStorage.removeItem(USER_INFO_KEY);
};

export const getValidRememberedToken = async () => {
  const token = await getToken();
  const rememberMe = await getRememberMe();

  if (token && rememberMe === 'true' && isTokenValid(token)) {
    return token;
  }

  if (token && (!rememberMe || !isTokenValid(token))) {
    await clearAuth();
  }

  return null;
};
