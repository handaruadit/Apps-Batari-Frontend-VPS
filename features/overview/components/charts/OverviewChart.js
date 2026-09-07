//========== IMPORTS ==========
import { useAppSettings } from "@/context/AppSettingsContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { ENERGY_SERIES_CONFIG } from "../../constants/overviewConstants";
import { shareDailyChartCsv } from "../../utils/csvExport";
import {
  getSelectedDateText,
  hasChartData,
  normalizeDayPowerSeries,
} from "../../utils/chartPresentation";
import ChartEmptyState from "./ChartEmptyState";
import EnergyMonthChart from "./EnergyMonthChart";
import EnergyYearChart from "./EnergyYearChart";
import LifetimeChart from "./LifetimeChart";
import PowerDayChart from "./PowerDayChart";
import styles from "./chart.styles";

//========== COMPONENT ==========
export default function OverviewChart({
  chartStatus,
  comparisonSeries = null,
  isComparisonActive = false,
  isLoadingComparison = false,
  lastTimestamp,
  mode = "portrait",
  onFullscreenPress,
  onToggleComparison,
  period,
  selectedDay,
  selectedMonth,
  selectedYear,
  series,
  ...chartProps
}) {
  const { colors, t } = useAppSettings();
  const [isSavingCsv, setIsSavingCsv] = useState(false);
  const aggregateKeys = ENERGY_SERIES_CONFIG.map((item) => item.key);
  const hasData = period === "day"
    ? hasChartData(normalizeDayPowerSeries(series))
    : hasChartData(series, aggregateKeys);

  //========== EVENT HANDLERS ==========
  const handleSaveCsv = async () => {
    try {
      setIsSavingCsv(true);
      await shareDailyChartCsv({
        series,
        dateText: getSelectedDateText(
          selectedDay,
          selectedMonth,
          selectedYear,
        ),
        unavailableMessage: t("csvUnavailable"),
      });
      Alert.alert(t("saveAsCsv"), t("csvSaved"));
    } catch (error) {
      Alert.alert(t("csvFailed"), error?.message || t("csvUnavailable"));
    } finally {
      setIsSavingCsv(false);
    }
  };

  if (!hasData) {
    return (
      <ChartEmptyState
        colors={colors}
        lastTimestamp={lastTimestamp}
        status={chartStatus}
        t={t}
      />
    );
  }

  const commonProps = {
    ...chartProps,
    comparisonSeries,
    isComparisonActive,
    mode,
    selectedDay,
    selectedMonth,
    selectedYear,
    series,
  };

  //========== RENDER HELPERS ==========
  const renderChart = () => {
    switch (period) {
      case "day":
        return <PowerDayChart {...commonProps} />;
      case "month":
        return <EnergyMonthChart {...commonProps} />;
      case "year":
        return <EnergyYearChart {...commonProps} />;
      case "lifetime":
        return <LifetimeChart {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {mode === "portrait" && (
        <View style={styles.toolbar}>
          <View style={{ flex: 1 }}>
            {period === "day" && onToggleComparison && (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={onToggleComparison}
                style={[
                  styles.comparePill,
                  {
                    borderColor: isComparisonActive
                      ? colors.accent
                      : colors.bubbleBorder,
                    backgroundColor: isComparisonActive
                      ? colors.accent
                      : "transparent",
                  },
                ]}
              >
                {isLoadingComparison ? (
                  <ActivityIndicator
                    size="small"
                    color={isComparisonActive ? "#FFFFFF" : colors.accent}
                  />
                ) : (
                  <Ionicons
                    name="swap-horizontal"
                    size={15}
                    color={isComparisonActive ? "#FFFFFF" : colors.accent}
                  />
                )}
                <Text
                  style={[
                    styles.comparePillText,
                    {
                      color: isComparisonActive ? "#FFFFFF" : colors.text,
                    },
                  ]}
                >
                  {isComparisonActive
                    ? t("compareYesterdayActive")
                    : t("compareYesterday")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.toolbarActions}>
            {period === "day" && (
              <TouchableOpacity
                activeOpacity={0.75}
                disabled={isSavingCsv}
                onPress={handleSaveCsv}
                style={[
                  styles.toolbarButton,
                  { borderColor: colors.bubbleBorder },
                ]}
              >
                {isSavingCsv ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Ionicons
                    name="download-outline"
                    size={17}
                    color={colors.accent}
                  />
                )}
              </TouchableOpacity>
            )}
            {onFullscreenPress && (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={onFullscreenPress}
                style={[
                  styles.toolbarButton,
                  { borderColor: colors.bubbleBorder },
                ]}
              >
                <Ionicons
                  name="expand-outline"
                  size={17}
                  color={colors.accent}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      {renderChart()}
    </View>
  );
}
