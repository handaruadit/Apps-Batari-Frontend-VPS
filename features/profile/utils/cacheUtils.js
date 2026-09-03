import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

//===== (Format Bytes Helper) ======
export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

//===== (Is Temporary Key) ======
function isTemporaryCacheKey(key) {
  const protectedKeys = [
    "userToken",
    "userInfo",
    "rememberMe",
    "theme",
    "language",
    "pinned_plants",
    "notification",
  ];

  return !protectedKeys.some((protectedKey) => key.includes(protectedKey));
}

//===== (Get Directory Size Recursive) ======
async function getDirectorySizeBytes(dirUri) {
  let size = 0;
  try {
    if (!dirUri) return 0;
    const dirInfo = await FileSystem.getInfoAsync(dirUri);
    if (!dirInfo.exists) return 0;

    const files = await FileSystem.readDirectoryAsync(dirUri);
    for (const fileName of files) {
      const fileUri = dirUri.endsWith("/") ? `${dirUri}${fileName}` : `${dirUri}/${fileName}`;
      const info = await FileSystem.getInfoAsync(fileUri);
      if (info.exists) {
        if (info.isDirectory) {
          size += await getDirectorySizeBytes(fileUri);
        } else if (typeof info.size === "number") {
          size += info.size;
        }
      }
    }
  } catch {
    // Non-fatal if folder is inaccessible
  }
  return size;
}

//===== (Get App Cache Size) ======
export async function getAppCacheSize() {
  let totalBytes = 0;

  // 1. Hitung ukuran file di FileSystem.cacheDirectory
  try {
    if (FileSystem?.cacheDirectory) {
      totalBytes += await getDirectorySizeBytes(FileSystem.cacheDirectory);
    }
  } catch {
    // Non-fatal
  }

  // 2. Hitung ukuran item cache sementara di AsyncStorage
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const tempKeys = allKeys.filter(isTemporaryCacheKey);

    if (tempKeys.length > 0) {
      const entries = await AsyncStorage.multiGet(tempKeys);
      for (const [k, v] of entries) {
        totalBytes += (k ? k.length : 0) + (v ? v.length : 0);
      }
    }
  } catch {
    // Non-fatal
  }

  return formatBytes(totalBytes);
}

//===== (Clear App Cache) ======
export async function clearAppCache() {
  // 1. Bersihkan file di FileSystem.cacheDirectory
  try {
    if (FileSystem?.cacheDirectory) {
      const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
      for (const fileName of files) {
        const fileUri = FileSystem.cacheDirectory.endsWith("/")
          ? `${FileSystem.cacheDirectory}${fileName}`
          : `${FileSystem.cacheDirectory}/${fileName}`;
        try {
          await FileSystem.deleteAsync(fileUri, { idempotent: true });
        } catch {
          // Ignore single file error
        }
      }
    }
  } catch {
    // Non-fatal
  }

  // 2. Bersihkan kunci cache sementara di AsyncStorage
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const tempKeys = allKeys.filter(isTemporaryCacheKey);

    if (tempKeys.length > 0) {
      await AsyncStorage.multiRemove(tempKeys);
    }
  } catch {
    // Non-fatal
  }

  // 3. Kembalikan ukuran cache riil setelah dibersihkan
  return await getAppCacheSize();
}
