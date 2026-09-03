//===== (Imports) ======
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

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
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // Non-fatal
}

//===== (setupNotificationChannel) ======
async function setupNotificationChannel() {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync("station-alerts", {
      name: "Station Status Alerts",
      importance: Notifications.AndroidImportance.MAX,
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
  try {
    await setupNotificationChannel();
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
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
