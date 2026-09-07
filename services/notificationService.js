//===== (Imports) ======
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

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
        shouldPlaySound: true,
        shouldSetBadge: false,
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
    await Notifications.setNotificationChannelAsync("station-alerts", {
      name: "Station Status Alerts",
      importance: Notifications.AndroidImportance?.MAX ?? 5,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00AEEF",
      sound: "default",
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
export async function triggerLocalNotification({ title, body, data = {} }) {
  if (!Notifications?.scheduleNotificationAsync) return false;
  try {
    await setupNotificationChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority?.MAX ?? 2,
        ...(Platform.OS === "android" ? { channelId: "station-alerts" } : {}),
      },
      trigger: null, // Send immediately
    });
    return true;
  } catch (err) {
    console.warn("[notification] Native trigger failed:", err?.message);
    return false;
  }
}

//===== (testStationNotification) ======
export async function testStationNotification(mode = "offline", plantName = "Solar Plant Utama") {
  const isOffline = mode === "offline";
  const name = plantName || "Solar Plant Utama";
  return triggerLocalNotification({
    title: isOffline
      ? `Station Offline: ${name}`
      : `Station Online: ${name}`,
    body: isOffline
      ? `Station '${name}' telah terputus dari jaringan.`
      : `Station '${name}' kembali terhubung dan aktif.`,
    data: { type: isOffline ? "station_offline" : "station_online" },
  });
}
