//===== (Imports) ======
import { Text, View } from "react-native";

import styles from "@/features/devices/styles/deviceListStyles";
import {
  formatBatteryParameterValue,
  getBatteryParameterRows,
} from "@/features/devices/utils/batteryParameters";

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
      <Text style={[styles.parameterTitle, { color: colors.text }]}>
        {t("batteryParameters")}
      </Text>
      {batteryParameterRows.length > 0 ? (
        batteryParameterRows.map((row) => (
          <View
            key={`battery-${row.key}`}
            style={[
              styles.parameterRow,
              themeMode === "light" && {
                borderBottomColor: "rgba(8,174,234,0.14)",
              },
            ]}
          >
            <Text style={[styles.parameterType, { color: colors.text }]}>
              {row.label}
            </Text>
            <Text style={[styles.parameterValue, { color: colors.accent }]}>
              {formatBatteryParameterValue(row.value, row.key)}
            </Text>
          </View>
        ))
      ) : (
        <Text
          style={[styles.emptyParameterText, { color: colors.textMuted }]}
        >
          {t("noDataAvailable")}
        </Text>
      )}
    </View>
  );
}
