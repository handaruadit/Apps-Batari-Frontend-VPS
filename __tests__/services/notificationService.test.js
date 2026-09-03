//===== (Imports) ======
import {
  DEFAULT_NOTIF_SETTINGS,
  getNotificationSettings,
  saveNotificationSettings,
  testStationNotification,
  triggerLocalNotification,
} from "@/services/notificationService";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("notificationService", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it("returns default settings when none are stored", async () => {
    const settings = await getNotificationSettings();
    expect(settings).toEqual(DEFAULT_NOTIF_SETTINGS);
  });

  it("saves and retrieves updated notification settings", async () => {
    const newSettings = { ...DEFAULT_NOTIF_SETTINGS, stationOffline: false };
    await saveNotificationSettings(newSettings);

    const retrieved = await getNotificationSettings();
    expect(retrieved.stationOffline).toBe(false);
    expect(retrieved.stationOnline).toBe(true);
  });

  it("sends native local notification to phone notification tray", async () => {
    const result = await triggerLocalNotification({
      title: "Station Offline: Solar Plant Utama",
      body: "Station 'Solar Plant Utama' telah terputus dari jaringan.",
    });

    expect(result).toBe(true);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: "Station Offline: Solar Plant Utama",
          body: "Station 'Solar Plant Utama' telah terputus dari jaringan.",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        }),
        trigger: null,
      }),
    );
  });

  it("testStationNotification triggers offline notification to phone tray", async () => {
    const result = await testStationNotification("offline");

    expect(result).toBe(true);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringContaining("Offline"),
        }),
      }),
    );
  });
});
