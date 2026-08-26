//===== (Imports) ======
import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

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
        <Text style={[styles.infoValue, { color: colors.text }]}>
          {item.device_id || "-"}
        </Text>
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
