//===== (Imports) ======
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import styles from "@/features/devices/styles/deviceListStyles";
import {
  formatBatteryParameterValue,
  getBatteryParameterRows,
} from "@/features/devices/utils/batteryParameters";

// Helper icon for battery parameters
function getBatteryParamIcon(key) {
  switch (key) {
    case "soc":
      return "battery-charging-outline";
    case "voltage":
      return "speedometer-outline";
    case "current":
      return "pulse-outline";
    case "power":
      return "flash-outline";
    default:
      return "hardware-chip-outline";
  }
}

//===== (Battery Parameter List) ======
export default function BatteryParameterList({
  device,
  t,
  colors,
  themeMode,
}) {
  const batteryParameterRows = getBatteryParameterRows(device, t);

  return (
    <View
      style={[
        styles.parameterSection,
        themeMode === "light" && {
          borderTopColor: colors.bubbleBorder,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
        }}
      >
        <Ionicons
          name="battery-half-outline"
          size={16}
          color={colors.accent || "#18AEE6"}
        />
        <Text
          style={[
            styles.parameterTitle,
            { color: colors.text, marginBottom: 0 },
          ]}
        >
          {t("batteryParameters") || "Battery / BMS Parameters"}
        </Text>
      </View>

      {batteryParameterRows.length > 0 ? (
        <View style={styles.batteryGrid}>
          {batteryParameterRows.map((row) => (
            <View
              key={`battery-${row.key}`}
              style={[
                styles.batteryTile,
                {
                  backgroundColor:
                    colors.input || "rgba(255, 255, 255, 0.04)",
                  borderColor:
                    colors.inputBorder || "rgba(255, 255, 255, 0.08)",
                },
              ]}
            >
              <View style={styles.telemetryTileHeader}>
                <Ionicons
                  name={getBatteryParamIcon(row.key)}
                  size={12}
                  color={row.key === "soc" ? "#10B981" : colors.textMuted}
                />
                <Text
                  style={[
                    styles.telemetryTileLabel,
                    { color: colors.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {row.label}
                </Text>
              </View>
              <Text
                style={[
                  styles.telemetryTileValue,
                  { color: row.key === "soc" ? "#10B981" : colors.text },
                ]}
                numberOfLines={1}
              >
                {formatBatteryParameterValue(row.value, row.key)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text
          style={[
            styles.emptyParameterText,
            {
              color: colors.textMuted,
              fontStyle: "italic",
              marginTop: 4,
            },
          ]}
        >
          {t("noDataAvailable") ||
            "Tidak ada telemetri baterai (Sistem On-Grid)"}
        </Text>
      )}
    </View>
  );
}
