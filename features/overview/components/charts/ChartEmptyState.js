//========== IMPORTS ==========
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { formatLastDataTime } from "../../utils/chartFormat";
import ChartSkeleton from "./ChartSkeleton";
import styles from "./chart.styles";

//========== COMPONENT ==========
export default function ChartEmptyState({
  colors,
  isLightMode,
  lastTimestamp,
  status,
  t,
  width,
}) {
  if (status === "loading") {
    return (
      <ChartSkeleton
        colors={colors}
        isLightMode={isLightMode}
        width={width}
      />
    );
  }

  const isError = status === "error";
  const formattedTimestamp = formatLastDataTime(lastTimestamp);

  return (
    <View style={styles.state}>
      <View
        style={[
          localStyles.iconCircle,
          {
            backgroundColor: isError
              ? "rgba(239, 68, 68, 0.12)"
              : "rgba(24, 174, 230, 0.12)",
          },
        ]}
      >
        <Ionicons
          name={isError ? "cloud-offline-outline" : "analytics-outline"}
          size={28}
          color={isError ? "#EF4444" : "#18AEE6"}
        />
      </View>
      <Text style={[styles.stateTitle, { color: colors.text }]}>
        {isError ? t("chartLoadError") : t("noHistoricalData")}
      </Text>
      <Text style={[styles.stateBody, { color: colors.textMuted }]}>
        {isError ? t("chartTryAgain") : t("historicalDataHint")}
        {!isError && formattedTimestamp
          ? `\n${t("lastDataReceived")}: ${formattedTimestamp}`
          : ""}
      </Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
});
