import {
  DEFAULT_NOTIF_SETTINGS,
  getNotificationSettings,
  saveNotificationSettings,
  testStationNotification,
} from "@/services/notificationService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { profileStyles as styles } from "../styles";

//===== (NotificationSettingsModal) ======
export default function NotificationSettingsModal({
  visible,
  onClose,
  colors,
  language,
  t,
}) {
  const [settings, setSettings] = useState(DEFAULT_NOTIF_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Load saved settings
  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      getNotificationSettings().then((saved) => {
        setSettings(saved);
        setIsLoading(false);
      });
    }
  }, [visible]);

  // Toggle single setting
  const updateSetting = (key, val) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveNotificationSettings(settings);
      Alert.alert(
        t("success"),
        t("notifSettingsSaved"),
        [{ text: "OK", onPress: onClose }],
      );
    } catch {
      Alert.alert(t("failed"), t("notifSettingsFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger test notification
  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      const res = await testStationNotification("offline", "Batari Demo Station", language);
      if (res === true || res?.success) {
        Alert.alert(
          language === "en" ? "Notification Triggered" : "Notifikasi Dipicu",
          language === "en"
            ? "A test notification was triggered. Check your notification tray."
            : "Notifikasi uji coba berhasil dikirim. Periksa tray notifikasi HP Anda."
        );
      } else if (res?.reason === "permission_denied") {
        Alert.alert(
          language === "en" ? "Permission Denied" : "Izin Ditolak",
          language === "en"
            ? "Please enable notifications for BySense in your phone's system settings."
            : "Silakan aktifkan izin notifikasi untuk BySense di pengaturan sistem HP Anda."
        );
      } else if (res?.reason === "expo_go") {
        Alert.alert(
          language === "en"
            ? "🔔 [Simulation] Station Offline"
            : "🔔 [Simulasi Notifikasi] Stasiun Offline",
          language === "en"
            ? "Station 'Batari Demo Station' has been disconnected from the network (Offline).\n\n(Note: Native system tray notification and FCM push are fully active on standalone APK builds. Expo Go on Android restricts notification tray access.)"
            : "Stasiun 'Batari Demo Station' telah terputus dari jaringan (Offline).\n\n(Catatan: Notifikasi tray sistem HP dan push FCM aktif 100% pada file instalasi APK / rilis Play Store. Aplikasi Expo Go Android membatasi notifikasi tray.)"
        );
      } else {
        Alert.alert(
          language === "en" ? "Notice" : "Pemberitahuan",
          language === "en"
            ? "Notification request dispatched to server."
            : "Pengiriman notifikasi telah diteruskan ke server."
        );
      }
    } catch (e) {
      Alert.alert(t("failed"), e?.message || "Test notification failed");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalDismissArea} onPress={onClose} />

        <View
          style={[
            styles.bottomSheetCard,
            {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
              maxHeight: "85%",
            },
          ]}
        >
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {t("notificationSetting")}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4 }}
            >
              {/* Option 1: Station Offline */}
              <View style={styles.switchRow}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 10 }}>
                  <Ionicons
                    name="cloud-offline-outline"
                    size={18}
                    color="#EF4444"
                    style={{ marginRight: 8 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.switchTitle, { color: colors.text }]}>
                      {t("notifStationOfflineTitle")}
                    </Text>
                    <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
                      {t("notifStationOfflineSubtitle")}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.stationOffline}
                  onValueChange={(v) => updateSetting("stationOffline", v)}
                  trackColor={{ false: "#64748B", true: colors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Option 2: Station Online */}
              <View style={styles.switchRow}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 10 }}>
                  <Ionicons
                    name="cloud-done-outline"
                    size={18}
                    color="#10B981"
                    style={{ marginRight: 8 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.switchTitle, { color: colors.text }]}>
                      {t("notifStationOnlineTitle")}
                    </Text>
                    <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
                      {t("notifStationOnlineSubtitle")}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.stationOnline}
                  onValueChange={(v) => updateSetting("stationOnline", v)}
                  trackColor={{ false: "#64748B", true: colors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Option 3: Battery Alarm */}
              <View style={styles.switchRow}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 10 }}>
                  <Ionicons
                    name="battery-half-outline"
                    size={18}
                    color="#F59E0B"
                    style={{ marginRight: 8 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.switchTitle, { color: colors.text }]}>
                      {t("notifBatteryAlarmTitle")}
                    </Text>
                    <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
                      {t("notifBatteryAlarmSubtitle")}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.batteryAlarm}
                  onValueChange={(v) => updateSetting("batteryAlarm", v)}
                  trackColor={{ false: "#64748B", true: colors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Option 4: Daily Summary */}
              <View style={styles.switchRow}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 10 }}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={18}
                    color={colors.accent}
                    style={{ marginRight: 8 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.switchTitle, { color: colors.text }]}>
                      {t("notifDailySummaryTitle")}
                    </Text>
                    <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
                      {t("notifDailySummarySubtitle")}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.dailySummary}
                  onValueChange={(v) => updateSetting("dailySummary", v)}
                  trackColor={{ false: "#64748B", true: colors.accent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Test Notification Button */}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 11,
                  marginTop: 14,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.accent,
                  backgroundColor: "rgba(24, 174, 230, 0.08)",
                }}
                onPress={handleTestNotification}
                disabled={isTesting}
              >
                {isTesting ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <>
                    <Ionicons
                      name="notifications-outline"
                      size={17}
                      color={colors.accent}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Nunito-Bold",
                        color: colors.accent,
                      }}
                    >
                      {language === "en"
                        ? "Send Test Notification"
                        : "Kirim Uji Coba Notifikasi"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Informational Note */}
              <View
                style={{
                  marginTop: 10,
                  marginBottom: 6,
                  padding: 10,
                  borderRadius: 8,
                  backgroundColor: colors.bubbleBorder ? `${colors.bubbleBorder}33` : "rgba(100,116,139,0.1)",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Nunito-Regular",
                    color: colors.textMuted,
                    lineHeight: 16,
                  }}
                >
                  ℹ️{" "}
                  {language === "en"
                    ? "Remote push notifications operate via FCM in standalone APK / Play Store builds. Expo Go restricts remote notifications."
                    : "Notifikasi push remote beroperasi via FCM pada build APK mandiri / Play Store. Aplikasi Expo Go membatasi notifikasi remote."}
                </Text>
              </View>
            </ScrollView>
          )}

          <View style={styles.modalActionRow}>
            <TouchableOpacity
              style={[
                styles.modalConfirmBtn,
                { backgroundColor: colors.accent, width: "100%" },
              ]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalConfirmText}>{t("saveChanges")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
