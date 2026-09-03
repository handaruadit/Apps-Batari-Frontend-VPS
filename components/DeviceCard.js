//===== (Imports) ======
import ConnectionStatus from "@/components/device-card/ConnectionStatus";
import DeviceCardMenu from "@/components/device-card/DeviceCardMenu";
import {
  formatCityProvince,
  getPlantConnectionStatus,
} from "@/components/device-card/helpers";
import { styles } from "@/components/device-card/styles";
import { useAppSettings } from "@/context/AppSettingsContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

//===== (DeviceCard) ======
export default function DeviceCard({
  device,
  onPress,
  menuVisible: controlledMenuVisible,
  onMenuOpen,
  onCloseMenu,
  onPinToggle,
  onAddDatalogger,
  onEdit,
  onDelete,
  onManageAccess,
  isPinned = false,
  canEdit = true,
  canDelete = true,
  canAddDatalogger = false,
  canManageAccess = false,
}) {
  const { colors, t, themeMode } = useAppSettings();
  const [localMenuVisible, setLocalMenuVisible] = useState(false);

  const isMenuOpen =
    controlledMenuVisible !== undefined
      ? controlledMenuVisible
      : localMenuVisible;

  const pulseAnim = useRef(new Animated.Value(0.45)).current;
  const connectionStatus = getPlantConnectionStatus(device);
  const cityProvinceText = formatCityProvince(device);

  //===== (handleToggleMenu) ======
  const handleToggleMenu = () => {
    if (onMenuOpen) {
      onMenuOpen();
    } else {
      setLocalMenuVisible((prev) => !prev);
    }
  };

  //===== (handleClose) ======
  const handleClose = () => {
    if (onCloseMenu) {
      onCloseMenu();
    } else {
      setLocalMenuVisible(false);
    }
  };

  //===== (Status Pulse Effect) ======
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

  //===== (handleEdit) ======
  const handleEdit = () => {
    handleClose();
    onEdit?.(device);
  };

  //===== (handlePinToggle) ======
  const handlePinToggle = () => {
    handleClose();
    onPinToggle?.(device);
  };

  //===== (handleAddDatalogger) ======
  const handleAddDatalogger = () => {
    handleClose();
    onAddDatalogger?.(device);
  };

  //===== (handleManageAccess) ======
  const handleManageAccess = () => {
    handleClose();
    onManageAccess?.(device);
  };

  //===== (handleDelete) ======
  const handleDelete = () => {
    handleClose();
    onDelete?.(device);
  };

  const isLight = themeMode === "light";

  return (
    <View
      style={[
        styles.card,
        isLight && {
          backgroundColor: colors.bubble,
          borderColor: colors.bubbleBorder,
        },
        isPinned && {
          borderColor: isLight
            ? "rgba(24, 174, 230, 0.6)"
            : "rgba(24, 174, 230, 0.45)",
          borderWidth: 1.2,
        },
      ]}
    >
      <View style={styles.imageWrapper}>
        <ImageBackground
          source={require("@/assets/images/solar-bg.jpg")}
          style={styles.bg}
          imageStyle={styles.imageStyle}
          resizeMode="cover"
        >
          <TouchableOpacity
            style={styles.imageOverlay}
            activeOpacity={0.9}
            onPress={() => {
              if (isMenuOpen) {
                handleClose();
              } else {
                onPress?.();
              }
            }}
          >
            <View style={styles.cardTopRow}>
              {isPinned ? (
                <View style={styles.pinnedBadge}>
                  <Ionicons name="pin" size={11} color="#18AEE6" />
                  <Text style={styles.pinnedText}>Pinned</Text>
                </View>
              ) : (
                <View />
              )}
              <TouchableOpacity
                onPress={handleToggleMenu}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={[
                  styles.cardHeaderIconBtn,
                  {
                    backgroundColor: isMenuOpen
                      ? isLight
                        ? "rgba(0, 0, 0, 0.08)"
                        : "rgba(255, 255, 255, 0.18)"
                      : "rgba(0, 0, 0, 0.35)",
                  },
                ]}
              >
                <Ionicons
                  name={isMenuOpen ? "close" : "ellipsis-vertical"}
                  size={18}
                  color={
                    isMenuOpen
                      ? isLight
                        ? colors.text || "#0F172A"
                        : "#FFFFFF"
                      : "#FFFFFF"
                  }
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ImageBackground>

        {/* In-Image Menu Overlay */}
        <DeviceCardMenu
          visible={isMenuOpen}
          colors={colors}
          themeMode={themeMode}
          isPinned={isPinned}
          canEdit={canEdit}
          canAddDatalogger={canAddDatalogger}
          canManageAccess={canManageAccess}
          canDelete={canDelete}
          t={t}
          onClose={handleClose}
          onPinToggle={handlePinToggle}
          onEdit={handleEdit}
          onAddDatalogger={handleAddDatalogger}
          onManageAccess={handleManageAccess}
          onDelete={handleDelete}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.textSection,
          isLight && { backgroundColor: colors.bubble },
        ]}
        activeOpacity={0.8}
        onPress={() => {
          if (isMenuOpen) {
            handleClose();
          } else {
            onPress?.();
          }
        }}
      >
        <Text
          style={[
            styles.title,
            isLight && { color: colors.text },
          ]}
          numberOfLines={1}
        >
          {device.name}
        </Text>
        <Text
          style={[
            styles.subtitle,
            isLight && { color: colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {cityProvinceText}
        </Text>
        <ConnectionStatus status={connectionStatus} pulseAnim={pulseAnim} />
      </TouchableOpacity>
    </View>
  );
}
