//===== (Imports) ======
import { styles } from "@/components/device-card/styles";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

//===== (MenuAction) ======
function MenuAction({
  icon,
  label,
  iconColor,
  textColor,
  danger = false,
  onPress,
  themeMode,
}) {
  const isLight = themeMode === "light";

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[
        styles.menuItem,
        {
          backgroundColor: danger
            ? isLight
              ? "rgba(239, 68, 68, 0.1)"
              : "rgba(239, 68, 68, 0.18)"
            : isLight
              ? "rgba(24, 174, 230, 0.08)"
              : "rgba(255, 255, 255, 0.08)",
        },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text
        style={[
          styles.menuText,
          { color: textColor },
          danger && styles.deleteText,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

//===== (DeviceCardMenu) ======
export default function DeviceCardMenu({
  visible,
  colors,
  themeMode,
  isPinned,
  canEdit,
  canAddDatalogger,
  canManageAccess,
  canDelete,
  t,
  onClose,
  onPinToggle,
  onEdit,
  onAddDatalogger,
  onManageAccess,
  onDelete,
}) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.95);
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacityAnim, scaleAnim]);

  if (!visible) {
    return null;
  }

  const isLight = themeMode === "light";

  // Collect all available actions
  const allActions = [
    {
      key: "pin",
      icon: isPinned ? "pin" : "pin-outline",
      label: isPinned ? t("unpin") : t("pin"),
      iconColor: colors.accent,
      textColor: colors.text,
      onPress: onPinToggle,
    },
    canEdit && {
      key: "edit",
      icon: "create-outline",
      label: t("edit"),
      iconColor: colors.accent,
      textColor: colors.text,
      onPress: onEdit,
    },
    canAddDatalogger && {
      key: "addDatalogger",
      icon: "hardware-chip-outline",
      label: t("addDatalogger"),
      iconColor: colors.accent,
      textColor: colors.text,
      onPress: onAddDatalogger,
    },
    canManageAccess && {
      key: "manageAccess",
      icon: "people-outline",
      label: t("manageAccess"),
      iconColor: colors.accent,
      textColor: colors.text,
      onPress: onManageAccess,
    },
    canDelete && {
      key: "delete",
      icon: "trash-outline",
      label: t("delete"),
      iconColor: "#EF4444",
      textColor: "#EF4444",
      danger: true,
      onPress: onDelete,
    },
  ].filter(Boolean);

  // Split into 2 columns for side-by-side display
  const midIndex = Math.ceil(allActions.length / 2);
  const col1 = allActions.slice(0, midIndex);
  const col2 = allActions.slice(midIndex);

  return (
    <Animated.View
      style={[
        styles.imageMenuOverlay,
        {
          backgroundColor: isLight
            ? "rgba(255, 255, 255, 0.96)"
            : "rgba(15, 23, 42, 0.95)",
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Top-Right Close 'X' Button */}
      <TouchableOpacity
        style={[
          styles.menuCloseBtn,
          {
            backgroundColor: isLight
              ? "rgba(0, 0, 0, 0.08)"
              : "rgba(255, 255, 255, 0.18)",
          },
        ]}
        onPress={onClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="close"
          size={16}
          color={isLight ? "#0F172A" : "#FFFFFF"}
        />
      </TouchableOpacity>

      <View style={styles.menuGrid}>
        {/* Column 1 */}
        <View style={styles.menuColumn}>
          {col1.map((item) => (
            <MenuAction
              key={item.key}
              icon={item.icon}
              label={item.label}
              iconColor={item.iconColor}
              textColor={item.textColor}
              danger={item.danger}
              onPress={item.onPress}
              themeMode={themeMode}
            />
          ))}
        </View>

        {/* Column 2 */}
        <View style={styles.menuColumn}>
          {col2.map((item) => (
            <MenuAction
              key={item.key}
              icon={item.icon}
              label={item.label}
              iconColor={item.iconColor}
              textColor={item.textColor}
              danger={item.danger}
              onPress={item.onPress}
              themeMode={themeMode}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}
