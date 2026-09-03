//===== (Imports) ======
import {
  DEFAULT_NOTIF_SETTINGS,
  getNotificationSettings,
  saveNotificationSettings,
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
  t,
}) {
  const [settings, setSettings] = useState(DEFAULT_NOTIF_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        "Pengaturan notifikasi berhasil disimpan.",
        [{ text: "OK", onPress: onClose }],
      );
    } catch {
      Alert.alert("Error", "Gagal menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
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
                      Notifikasi Station Offline
                    </Text>
                    <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
                      Peringatan instan saat station terputus dari jaringan.
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
                      Notifikasi Station Online
                    </Text>
                    <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
                      Pemberitahuan saat station yang offline kembali normal.
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
                      Alarm Baterai
                    </Text>
                    <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
                      Peringatan saat SoC terlalu rendah atau ada anomali voltase.
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
                      Ringkasan Harian Daya
                    </Text>
                    <Text style={[styles.switchSubtitle, { color: colors.textMuted }]}>
                      Laporan ringkasan total produksi harian setiap sore.
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
            </ScrollView>
          )}

          <View style={[styles.modalActionRow, { marginTop: 12 }]}>
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
