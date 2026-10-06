import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiRequest } from "./apiClient";

// Safe loader for expo-notifications to prevent crash in Expo Go on Android
// (Remote push notifications native code was removed from Expo Go starting in SDK 53)
let Notifications = null;
try {
  Notifications = require("expo-notifications");
} catch {
  // Gracefully fallback when expo-notifications is not supported in environment
}

//===== (Storage Key) ======
const NOTIF_SETTINGS_KEY = "batari_notification_settings";

//===== (Default Settings) ======
export const DEFAULT_NOTIF_SETTINGS = {
  stationOffline: true,
  stationOnline: true,
  batteryAlarm: true,
  dailySummary: true,
};

//===== (Configure Foreground Notification) ======
// Ensures notifications are shown in phone tray even when app is open
try {
  if (Notifications?.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority?.MAX ?? "max",
      }),
    });
  }
} catch {
  // Non-fatal
}

//===== (setupNotificationChannel) ======
async function setupNotificationChannel() {
  if (Platform.OS !== "android" || !Notifications?.setNotificationChannelAsync) return;
  try {
    const channelConfig = {
      name: "Station Status Alerts",
      importance: Notifications.AndroidImportance?.MAX ?? 5,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#18AEE6",
      sound: "default",
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    };
    await Notifications.setNotificationChannelAsync("station-alerts", channelConfig);
    await Notifications.setNotificationChannelAsync("expo_notifications_fallback_notification_channel", {
      ...channelConfig,
      name: "Default Notifications",
    });
  } catch {
    // Non-fatal
  }
}

//===== (requestNotificationPermissions) ======
export async function requestNotificationPermissions() {
  if (!Notifications?.getPermissionsAsync) return false;
  try {
    const { status: current } = await Notifications.getPermissionsAsync();
    if (current === "granted") {
      await setupNotificationChannel();
      return true;
    }
    const { status: requested } =
      await Notifications.requestPermissionsAsync();
    if (requested === "granted") {
      await setupNotificationChannel();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

//===== (getNotificationSettings) ======
export async function getNotificationSettings() {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_SETTINGS_KEY);
    if (!raw) return DEFAULT_NOTIF_SETTINGS;
    return { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIF_SETTINGS;
  }
}

//===== (saveNotificationSettings) ======
export async function saveNotificationSettings(settings) {
  try {
    await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Non-fatal
  }
}

//===== (triggerLocalNotification) ======
// Sends native system notification directly to phone notification tray
export async function triggerLocalNotification({
  title,
  body,
  data = {},
  delaySeconds = 0,
}) {
  if (!Notifications?.scheduleNotificationAsync) {
    return false;
  }
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return false;
    }
    await setupNotificationChannel();

    const trigger = delaySeconds > 0
      ? {
          type: Notifications.SchedulableTriggerInputTypes?.TIME_INTERVAL ?? "timeInterval",
          seconds: delaySeconds,
          repeats: false,
          channelId: "station-alerts",
        }
      : null;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority?.MAX ?? "max",
        color: "#18AEE6",
        ...(Platform.OS === "android" ? { channelId: "station-alerts" } : {}),
      },
      trigger,
    });
    return true;
  } catch (err) {
    console.warn("[notification] Native trigger failed:", err?.message);
    return false;
  }
}

//===== (registerForPushNotificationsAsync) ======
export async function registerForPushNotificationsAsync() {
  if (!Notifications?.getExpoPushTokenAsync) {
    return null;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }
    await setupNotificationChannel();

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      "e255ea32-389f-4654-91bb-5817e7cef095";

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenData?.data;

    if (token) {
      await AsyncStorage.setItem("batari_expo_push_token", token);
      try {
        await apiRequest({
          path: "/api/auth/push-token",
          method: "POST",
          body: {
            pushToken: token,
            platform: Platform.OS,
          },
        });
      } catch {
        // Retry later if not authenticated yet
      }
      return token;
    }
  } catch (err) {
    console.warn("[push] Push token registration skipped:", err?.message);
    return null;
  }
  return null;
}

//===== (sendBackendTestPush) ======
export async function sendBackendTestPush({ language = "id", plantName = "Solar Plant Utama" } = {}) {
  try {
    const { body } = await apiRequest({
      path: "/api/auth/test-push",
      method: "POST",
      body: { language, plantName },
    });
    return body || { success: true };
  } catch (err) {
    return { success: false, error: err?.message };
  }
}

//===== (testStationNotification) ======
export async function testStationNotification(
  mode = "offline",
  plantName = "Solar Plant Utama",
  language = null,
  delaySeconds = 0,
) {
  // First attempt backend remote push dispatch
  let backendDispatched = false;
  try {
    await registerForPushNotificationsAsync();
    const backendRes = await sendBackendTestPush({
      language: language || "id",
      plantName,
    });
    if (backendRes?.success) {
      backendDispatched = true;
    }
  } catch {
    // Continue to local trigger
  }

  if (!Notifications?.scheduleNotificationAsync) {
    return {
      success: backendDispatched,
      reason: "expo_go",
    };
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return {
      success: false,
      reason: "permission_denied",
    };
  }

  let isEn = false;
  if (language) {
    isEn = language === "en";
  } else {
    try {
      const stored = await AsyncStorage.getItem("batari:language");
      isEn = stored === "en";
    } catch {
      isEn = false;
    }
  }
  const isOffline = mode === "offline";
  const name = plantName || (isEn ? "Main Solar Station" : "Stasiun Surya Utama");
  const ok = await triggerLocalNotification({
    title: isEn
      ? (isOffline ? `Station Offline: ${name}` : `Station Online: ${name}`)
      : (isOffline ? `Stasiun Offline: ${name}` : `Stasiun Online: ${name}`),
    body: isEn
      ? (isOffline
          ? `Station '${name}' has been disconnected from the network (Offline).`
          : `Station '${name}' is back online and actively generating power.`)
      : (isOffline
          ? `Stasiun '${name}' telah terputus dari jaringan (Offline).`
          : `Stasiun '${name}' kembali terhubung dan aktif menghasilkan daya.`),
    data: { type: isOffline ? "station_offline" : "station_online" },
    delaySeconds,
  });

  if (ok || backendDispatched) {
    return true;
  }
  return {
    success: false,
    reason: "unknown",
  };
}
