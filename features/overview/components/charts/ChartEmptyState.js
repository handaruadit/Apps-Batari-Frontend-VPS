//========== IMPORTS ==========
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Text, View } from "react-native";
import { formatLastDataTime } from "../../utils/chartFormat";
import styles from "./chart.styles";

//========== COMPONENT ==========
export default function ChartEmptyState({ colors, lastTimestamp, status, t }) {
  if (status === "loading") {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.stateTitle, { color: colors.text }]}> 
          {t("loadingChart")}
        </Text>
      </View>
    );
  }

  const isError = status === "error";
  const formattedTimestamp = formatLastDataTime(lastTimestamp);

  return (
    <View style={styles.state}>
      <Ionicons
        name={isError ? "cloud-offline-outline" : "analytics-outline"}
        size={30}
        color={colors.textMuted}
      />
      <Text style={[styles.stateTitle, { color: colors.text }]}> 
        {isError ? t("chartLoadError") : t("noHistoricalData")}
      </Text>
      <Text style={[styles.stateBody, { color: colors.textSoft }]}> 
        {isError ? t("chartTryAgain") : t("historicalDataHint")}
        {!isError && formattedTimestamp
          ? `\n${t("lastDataReceived")}: ${formattedTimestamp}`
          : ""}
      </Text>
    </View>
  );
}
