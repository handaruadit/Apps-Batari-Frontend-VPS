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
        ToastAndroid.show(t ? t("deviceIdCopied") : "Device ID copied", ToastAndroid.SHORT);
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: "rgba(24, 174, 230, 0.12)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="hardware-chip-outline" size={18} color="#18AEE6" />
          </View>
          <Text
            style={[styles.inverterTitle, { color: colors.text, flex: 1 }]}
            numberOfLines={1}
          >
            {deviceTitle}
          </Text>
        </View>

        <View style={styles.cardHeaderRight}>
          {connectionLabel && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.connectStatus === 1
                      ? "rgba(22, 163, 74, 0.12)"
                      : "rgba(220, 38, 38, 0.12)",
                  borderColor:
                    item.connectStatus === 1
                      ? "rgba(22, 163, 74, 0.3)"
                      : "rgba(220, 38, 38, 0.3)",
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      item.connectStatus === 1 ? "#16A34A" : "#DC2626",
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      item.connectStatus === 1 ? "#16A34A" : "#DC2626",
                  },
                ]}
              >
                {connectionLabel}
              </Text>
            </View>
          )}

          {canUnlinkDevice && (
            <TouchableOpacity
              onPress={() => onDelete(item.device_id)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons
                name="delete-outline"
                size={22}
                color="#EF4444"
              />
            </TouchableOpacity>
          )}
        </View>
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
                {isCopied ? (t ? t("copied") : "Copied") : (t ? t("copy") : "Copy")}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

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

      {/* Inverter Performance Telemetry Tiles */}
      <View
        style={[
          styles.parameterSection,
          themeMode === "light" && {
            borderTopColor: colors.bubbleBorder,
          },
        ]}
      >
        <Text style={[styles.parameterTitle, { color: colors.text }]}>
          {t("inverterParameters") || "Inverter Parameters"}
        </Text>

        <View style={styles.telemetryGrid}>
          {/* Active Power Tile */}
          <View
            style={[
              styles.telemetryTile,
              {
                backgroundColor: colors.input || "rgba(255, 255, 255, 0.04)",
                borderColor: colors.inputBorder || "rgba(255, 255, 255, 0.08)",
              },
            ]}
          >
            <View style={styles.telemetryTileHeader}>
              <Ionicons name="flash" size={13} color="#18AEE6" />
              <Text
                style={[styles.telemetryTileLabel, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {t("power") || "Daya Aktif"}
              </Text>
            </View>
            <Text
              style={[styles.telemetryTileValue, { color: colors.text }]}
              numberOfLines={1}
            >
              {Number(item.power != null ? item.power : 0).toFixed(2)}{" "}
              <Text style={{ fontSize: 11, fontWeight: "600", color: colors.textMuted }}>
                kW
              </Text>
            </Text>
          </View>

          {/* Daily Yield Tile */}
          <View
            style={[
              styles.telemetryTile,
              {
                backgroundColor: colors.input || "rgba(255, 255, 255, 0.04)",
                borderColor: colors.inputBorder || "rgba(255, 255, 255, 0.08)",
              },
            ]}
          >
            <View style={styles.telemetryTileHeader}>
              <Ionicons name="sunny" size={13} color="#F59E0B" />
              <Text
                style={[styles.telemetryTileLabel, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {t("dailyProduction") || "Produksi Hari Ini"}
              </Text>
            </View>
            <Text
              style={[styles.telemetryTileValue, { color: colors.text }]}
              numberOfLines={1}
            >
              {Number(item.dailyEnergy != null ? item.dailyEnergy : 0).toFixed(2)}{" "}
              <Text style={{ fontSize: 11, fontWeight: "600", color: colors.textMuted }}>
                kWh
              </Text>
            </Text>
          </View>

          {/* Total Yield Tile (if present) */}
          {item.totalEnergy != null && Number(item.totalEnergy) > 0 ? (
            <View
              style={[
                styles.telemetryTile,
                {
                  backgroundColor: colors.input || "rgba(255, 255, 255, 0.04)",
                  borderColor: colors.inputBorder || "rgba(255, 255, 255, 0.08)",
                },
              ]}
            >
              <View style={styles.telemetryTileHeader}>
                <Ionicons name="trending-up" size={13} color="#10B981" />
                <Text
                  style={[styles.telemetryTileLabel, { color: colors.textMuted }]}
                  numberOfLines={1}
                >
                  {t("totalProduction") || "Total"}
                </Text>
              </View>
              <Text
                style={[styles.telemetryTileValue, { color: colors.text }]}
                numberOfLines={1}
              >
                {Number(item.totalEnergy).toFixed(1)}{" "}
                <Text style={{ fontSize: 11, fontWeight: "600", color: colors.textMuted }}>
                  kWh
                </Text>
              </Text>
            </View>
          ) : null}
        </View>
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
