import React, { useEffect, useRef, useState } from "react";
import { appColors, appFont } from "@/config/theme";
import { useAppSettings } from "@/context/AppSettingsContext";
import {
  View,
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ONLINE_THRESHOLD_MS = 15 * 60 * 1000;

function parseTimestamp(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    const milliseconds = value < 10000000000 ? value * 1000 : value;
    return Number.isFinite(milliseconds) ? milliseconds : null;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function getLatestDataTimestamp(device) {
  return Math.max(
    0,
    parseTimestamp(device?.latestDataStatusTimestamp) || 0,
    parseTimestamp(device?.latestDataAt) || 0,
    parseTimestamp(device?.latest_data_at) || 0,
    parseTimestamp(device?.lastDataAt) || 0,
    parseTimestamp(device?.last_data_at) || 0,
    parseTimestamp(device?.latestDataTime) || 0,
    parseTimestamp(device?.latest_data_time) || 0,
    parseTimestamp(device?.last_seen) || 0,
    parseTimestamp(device?.timestamp) || 0,
  );
}

function getPlantDeviceId(device) {
  return (
    device?.device_id ??
    device?.deviceId ??
    device?.latestDeviceId ??
    device?.latest_device_id ??
    null
  );
}

function getPlantConnectionStatus(device) {
  const hasDeviceId =
    device?.hasDeviceId === true || Boolean(getPlantDeviceId(device));
  const hasAllowedDevice =
    device?.hasAllowedDevice === true ||
    device?.allowed === true ||
    device?.allowed === "true" ||
    device?.deviceAllowed === true ||
    device?.deviceAllowed === "true" ||
    device?.device_allowed === true ||
    device?.device_allowed === "true";

  if (!hasDeviceId || !hasAllowedDevice) {
    return {
      key: "comissioning",
      isOnline: false,
      label: "Comissioning",
      timestamp: null,
    };
  }

  const latestTimestamp = getLatestDataTimestamp(device);
  const isOnline =
    latestTimestamp > 0 && Date.now() - latestTimestamp <= ONLINE_THRESHOLD_MS;

  return {
    key: isOnline ? "online" : "offline",
    isOnline,
    label: isOnline ? "Online" : "Offline",
    timestamp: latestTimestamp,
  };
}

function formatCityProvince(device) {
  const city = String(device?.city || "").trim();
  const province = String(device?.province || "").trim();
  const locationParts = [city, province].filter(Boolean);

  return locationParts.length ? locationParts.join(", ") : "-";
}

export default function DeviceCard({
  device,
  onPress,
  onPinToggle,
  onEdit,
  onDelete,
  isPinned = false,
  canEdit = true,
  canDelete = true,
}) {
  const { colors, themeMode } = useAppSettings();
  const [menuVisible, setMenuVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0.45)).current;
  const connectionStatus = getPlantConnectionStatus(device);
  const statusColor =
    connectionStatus.key === "comissioning"
      ? "#F97316"
      : connectionStatus.isOnline
        ? "#16A34A"
        : "#DC2626";
  const cityProvinceText = formatCityProvince(device);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit?.(device);
  };

  const handlePinToggle = () => {
    setMenuVisible(false);
    onPinToggle?.(device);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDelete?.(device);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.card,
          themeMode === "light" && {
            backgroundColor: colors.bubble,
            borderColor: colors.bubbleBorder,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.imageWrapper}>
          <ImageBackground
            source={require("@/assets/images/solar-bg.jpg")}
            style={styles.bg}
            imageStyle={styles.imageStyle}
            resizeMode="cover"
          >
            <View style={styles.imageOverlay}>
              <View style={styles.topRight}>
                <TouchableOpacity onPress={() => setMenuVisible(true)} hitSlop={10}>
          <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View
          style={[
            styles.textSection,
            themeMode === "light" && { backgroundColor: colors.bubble },
          ]}
        >
          <Text
            style={[styles.title, themeMode === "light" && { color: colors.text }]}
            numberOfLines={1}
          >
            {device.name}
          </Text>
          <Text
            style={[
              styles.subtitle,
              themeMode === "light" && { color: colors.textMuted },
            ]}
            numberOfLines={1}
          >
            {cityProvinceText}
          </Text>
          <View style={styles.statusRow}>
            <Animated.View
              style={[
                styles.statusDot,
                {
                  backgroundColor: statusColor,
                  opacity: pulseAnim,
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0.45, 1],
                        outputRange: [0.82, 1.18],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {connectionStatus.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View
            style={[
              styles.popupMenu,
              themeMode === "light" && {
                backgroundColor: colors.bubble,
                borderColor: colors.bubbleBorder,
                borderWidth: 1,
              },
            ]}
          >
            <TouchableOpacity style={styles.menuItem} onPress={handlePinToggle}>
              <Ionicons
                name={isPinned ? "pin" : "pin-outline"}
                size={18}
                color={colors.accent}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                {isPinned ? "Unpin" : "Pin"}
              </Text>
            </TouchableOpacity>

            {canEdit && (
              <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                <Ionicons name="create-outline" size={18} color={colors.accent} />
                <Text style={[styles.menuText, { color: colors.text }]}>Edit</Text>
              </TouchableOpacity>
            )}

            {canDelete && (
              <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
                <Text style={[styles.menuText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
  },
  imageWrapper: {
    height: 130,
  },
  bg: {
    flex: 1,
  },
  imageStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageOverlay: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  topRight: {
    alignItems: "flex-end",
  },
  textSection: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: appColors.bubble,
  },
  title: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: "600",
    fontFamily: appFont,
    marginBottom: 4,
    letterSpacing: 0,
  },
  subtitle: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: "400",
    fontFamily: appFont,
    letterSpacing: 0,
  },
  statusRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: appFont,
    letterSpacing: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 95,
    paddingRight: 22,
  },
  popupMenu: {
    width: 150,
    backgroundColor: appColors.bubble,
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  menuText: {
    fontSize: 15,
    color: appColors.text,
    fontWeight: "500",
    fontFamily: appFont,
  },
  deleteText: {
    color: "#DC2626",
  },
});
