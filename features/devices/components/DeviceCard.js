import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useState } from "react";
import { Platform, Text, ToastAndroid, TouchableOpacity, View } from "react-native";

import BatteryParameterList from "@/features/devices/components/BatteryParameterList";
import styles from "@/features/devices/styles/deviceListStyles";

//===== (formatLocation) ======
function formatLocation(plant) {
  const cityProvince = [plant?.city, plant?.province]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join(", ");

  return cityProvince || "-";
}

//===== (formatAddress) ======
function formatAddress(plant) {
  return plant?.address || plant?.location || "-";
}

//===== (Device Card) ======
export default function DeviceCard({
  item,
  index,
  plant,
  canUnlinkDevice,
  onDelete,
  t,
  colors,
  themeMode,
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyDeviceId = async () => {
    if (!item.device_id) return;

    try {
      await Clipboard.setStringAsync(String(item.device_id));
      setIsCopied(true);

      if (Platform.OS === "android") {
        ToastAndroid.show("Device ID berhasil disalin", ToastAndroid.SHORT);
      }

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.warn("Gagal menyalin:", err);
    }
  };

  const isStationTelemetry = String(item.device_id || "").startsWith(
    "DEYE_STATION_",
  );
  const deviceTitle = isStationTelemetry
    ? "Plant Telemetry"
    : item.deviceType || `${t("inverter")} ${index + 1}`;
  const connectionLabel =
    item.connectStatus === 1
      ? "Online"
      : item.connectStatus === 0
        ? "Offline"
        : null;

  return (
    <View
      style={[
        styles.headerCard,
        themeMode === "light" && {
          backgroundColor: colors.bubble,
          borderColor: colors.bubbleBorder,
          shadowOpacity: 0.08,
        },
      ]}
    >
      <View style={styles.cardTopRow}>
        <Text style={[styles.inverterTitle, { color: colors.text }]}>
          {deviceTitle}
        </Text>

        {canUnlinkDevice && (
          <View style={styles.cardHeaderRight}>
            <TouchableOpacity
              onPress={() => onDelete(item.device_id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name="delete-outline"
                size={22}
                color="#EF4444"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.infoBlock}>
        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
          {t("deviceId")}
        </Text>
        <View style={styles.deviceIdRow}>
          <Text style={[styles.infoValue, { color: colors.text, flexShrink: 1 }]}>
            {item.device_id || "-"}
          </Text>
          {item.device_id ? (
            <TouchableOpacity
              onPress={handleCopyDeviceId}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.copyButton,
                {
                  backgroundColor: isCopied
                    ? "rgba(16, 185, 129, 0.12)"
                    : colors.input || "rgba(24, 174, 230, 0.08)",
                  borderColor: isCopied
                    ? "rgba(16, 185, 129, 0.35)"
                    : colors.inputBorder || "rgba(24, 174, 230, 0.2)",
                },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isCopied ? "checkmark" : "copy-outline"}
                size={13}
                color={isCopied ? "#10B981" : colors.accent || "#18AEE6"}
              />
              <Text
                style={[
                  styles.copyButtonText,
                  { color: isCopied ? "#10B981" : colors.accent || "#18AEE6" },
                ]}
              >
                {isCopied ? "Tersalin" : "Salin"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {connectionLabel && (
        <View style={styles.infoBlock}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Status</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {connectionLabel}
          </Text>
        </View>
      )}

      <View style={styles.infoBlock}>
        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
          {t("address")}
        </Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>
          {formatAddress(plant)}
        </Text>
      </View>

      <View style={styles.infoBlock}>
        <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
          {t("cityProvince")}
        </Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>
          {formatLocation(plant)}
        </Text>
      </View>

      <BatteryParameterList
        device={item}
        t={t}
        colors={colors}
        themeMode={themeMode}
      />
    </View>
  );
}
