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
import { useEffect, useRef, useState } from "react";
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
  const [menuVisible, setMenuVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0.45)).current;
  const connectionStatus = getPlantConnectionStatus(device);
  const cityProvinceText = formatCityProvince(device);

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
    setMenuVisible(false);
    onEdit?.(device);
  };

  //===== (handlePinToggle) ======
  const handlePinToggle = () => {
    setMenuVisible(false);
    onPinToggle?.(device);
  };

  //===== (handleAddDatalogger) ======
  const handleAddDatalogger = () => {
    setMenuVisible(false);
    onAddDatalogger?.(device);
  };

  //===== (handleManageAccess) ======
  const handleManageAccess = () => {
    setMenuVisible(false);
    onManageAccess?.(device);
  };

  //===== (handleDelete) ======
  const handleDelete = () => {
    setMenuVisible(false);
    onDelete?.(device);
  };

  //===== (Render) ======
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
                <TouchableOpacity
                  onPress={() => setMenuVisible(true)}
                  hitSlop={10}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color="#FFFFFF"
                  />
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
            style={[
              styles.title,
              themeMode === "light" && { color: colors.text },
            ]}
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
          <ConnectionStatus status={connectionStatus} pulseAnim={pulseAnim} />
        </View>
      </TouchableOpacity>

      <DeviceCardMenu
        visible={menuVisible}
        colors={colors}
        themeMode={themeMode}
        isPinned={isPinned}
        canEdit={canEdit}
        canAddDatalogger={canAddDatalogger}
        canManageAccess={canManageAccess}
        canDelete={canDelete}
        t={t}
        onClose={() => setMenuVisible(false)}
        onPinToggle={handlePinToggle}
        onEdit={handleEdit}
        onAddDatalogger={handleAddDatalogger}
        onManageAccess={handleManageAccess}
        onDelete={handleDelete}
      />
    </>
  );
}
