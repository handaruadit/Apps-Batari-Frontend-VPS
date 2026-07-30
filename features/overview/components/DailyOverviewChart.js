//===== (Imports) ======
import { appColors } from "@/config/theme";
import { useAppSettings } from "@/context/AppSettingsContext";
import { Ionicons } from "@expo/vector-icons";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Circle as SvgCircle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import {
  CHART_HEIGHT,
  CHART_WIDTH,
  LANDSCAPE_CHART_LAYOUT,
  POWER_CHART_IDLE_RETURN_MS,
  POWER_CHART_LAYOUT,
  POWER_CHART_MARKER,
  POWER_CHART_MONTH_Y_RANGE,
  POWER_CHART_YEAR_Y_RANGE,
  POWER_CHART_Y_RANGE,
  POWER_SERIES_CONFIG,
} from "../constants/overviewConstants";
import {
  clampChartValue,
  getResponsiveChartTimeFontSize,
  getResponsiveChartTimeTicks,
} from "../utils/chartData";
import {
  buildAggregateChartStacks,
  buildSmoothAreaPath,
  buildSmoothLinePath,
  clampSelectedIndex,
  formatSelectedChartPercent,
  formatSelectedChartValue,
  formatSocPercentValue,
  getAggregateChartRange,
  getAggregateChartUnit,
  getAggregateTickValues,
  getDefaultChartSelectedIndex,
  getLatestChartPoint,
  getSelectedChartLabel,
  getSelectedChartValues,
  getSelectedDateText,
  getSelectedIndexFromX,
  getSelectedMarkerX,
  getSeriesMaxIndex,
} from "../utils/chartPresentation";
import { shareDailyChartCsv } from "../utils/csvExport";
import { formatChartHour } from "../utils/dateTime";
import { getPowerSeriesLabel, getSelectedInfoConfig } from "../utils/powerFlow";
import styles from "./dailyOverviewChart.styles";
//===== (DailyOverviewChart) ======
export default function DailyOverviewChart({
  series,
  chartWidth = CHART_WIDTH,
  chartHeight = CHART_HEIGHT,
  visibleSeries,
  onToggleSeries,
  currentTime = new Date(),
  showSwitches = true,
  showCurrentTime = true,
  onFullscreenPress,
  mode = "portrait",
  segment = "day",
  selectedDay = 1,
  selectedMonth = 1,
  selectedYear = new Date().getFullYear(),
  yearRange = [],
  selectedDataPercentages = {},
  socValue = null,
}) {
  const { colors, t, themeMode } = useAppSettings();
  const isLightMode = themeMode === "light";
  const chartTextColor = isLightMode ? colors.text : appColors.text;
  const chartMutedColor = isLightMode
    ? colors.textMuted
    : "rgba(248,250,252,0.52)";
  const chartGridColor = isLightMode
    ? "rgba(8,174,234,0.18)"
    : "rgba(248,250,252,0.12)";
  const chartSubGridColor = isLightMode
    ? "rgba(8,174,234,0.12)"
    : "rgba(248,250,252,0.1)";
  const chartStrongLineColor = isLightMode
    ? colors.text
    : "rgba(248,250,252,0.42)";
  const isCompactChart = chartWidth < 320;
  const isLandscapeMode = mode === "landscape";
  const isAggregateSegment =
    segment === "month" || segment === "year" || segment === "lifetime";
  const pad = {
    top: isLandscapeMode
      ? LANDSCAPE_CHART_LAYOUT.axisTopPadding
      : POWER_CHART_LAYOUT.paddingTop,
    right: isLandscapeMode
      ? LANDSCAPE_CHART_LAYOUT.axisRightPadding
      : isCompactChart
        ? 50
        : POWER_CHART_LAYOUT.paddingRight,
    bottom: isLandscapeMode
      ? LANDSCAPE_CHART_LAYOUT.axisBottomPadding
      : isCompactChart
        ? 46
        : POWER_CHART_LAYOUT.paddingBottom,
    left: isLandscapeMode
      ? LANDSCAPE_CHART_LAYOUT.axisLeftPadding
      : isCompactChart
        ? 40
        : POWER_CHART_LAYOUT.paddingLeft,
  };
  const innerWidth = Math.max(0, chartWidth - pad.left - pad.right);
  const innerHeight = chartHeight - pad.top - pad.bottom;
  const timeTicks = getResponsiveChartTimeTicks(innerWidth);
  const aggregateTicks = getAggregateTickValues(
    segment,
    selectedYear,
    selectedMonth,
    yearRange,
  );
  const aggregateStacks = buildAggregateChartStacks(
    series,
    segment,
    selectedYear,
    selectedMonth,
    yearRange,
  );
  const selectedMaxIndex = getSeriesMaxIndex(
    series,
    segment,
    selectedYear,
    selectedMonth,
    yearRange,
  );
  const [selectedIndex, setSelectedIndex] = useState(() =>
    getDefaultChartSelectedIndex(
      segment,
      selectedMaxIndex,
      selectedYear,
      selectedMonth,
      currentTime,
      yearRange,
    ),
  );
  const [isSavingCsv, setIsSavingCsv] = useState(false);
  const selectedDefaultIndex = getDefaultChartSelectedIndex(
    segment,
    selectedMaxIndex,
    selectedYear,
    selectedMonth,
    currentTime,
    yearRange,
  );
  const chartIdleTimerRef = useRef(null);
  const hasManualChartSelectionRef = useRef(false);
  const latestDefaultIndexRef = useRef(selectedDefaultIndex);
  const latestMaxIndexRef = useRef(selectedMaxIndex);
  latestDefaultIndexRef.current = selectedDefaultIndex;
  latestMaxIndexRef.current = selectedMaxIndex;
  //===== (Chart Gesture Padding) ======
  const chartGesturePad = useMemo(() => ({ left: pad.left }), [pad.left]);
  const barWidth = Math.max(
    4,
    Math.min(14, innerWidth / Math.max(aggregateStacks.itemCount * 2.4, 1)),
  );
  const timeLabelFontSize = getResponsiveChartTimeFontSize(innerWidth);
  const currentHour =
    currentTime.getHours() +
    currentTime.getMinutes() / 60 +
    currentTime.getSeconds() / 3600;
  const currentTimeX = pad.left + (Math.min(currentHour, 24) / 24) * innerWidth;
  const selectedMarkerX = getSelectedMarkerX(
    selectedIndex,
    pad,
    innerWidth,
    selectedMaxIndex,
    segment,
  );
  const datasets = POWER_SERIES_CONFIG.map((item) => ({
    ...item,
    data: series[item.key] || [],
  }));
  const activeDatasets = datasets.filter((item) => visibleSeries[item.key]);
  const activeConsumptionDatasets = activeDatasets.filter(
    (item) => item.group === "consumption",
  );
  const activeProductionDatasets = activeDatasets.filter(
    (item) => item.group === "production",
  );
  const aggregateRange =
  isAggregateSegment
    ? segment === "month"
      ? POWER_CHART_MONTH_Y_RANGE
      : segment === "year" || segment === "lifetime"
        ? POWER_CHART_YEAR_Y_RANGE
        : getAggregateChartRange(
            aggregateStacks,
            activeConsumptionDatasets,
            activeProductionDatasets,
          )
    : null;
  const yTicks = isAggregateSegment
    ? aggregateRange.leftTicks
    : POWER_CHART_Y_RANGE.leftTicks;
  const minY = isAggregateSegment
    ? aggregateRange.minY
    : POWER_CHART_Y_RANGE.minKw;
  const maxY = isAggregateSegment
    ? aggregateRange.maxY
    : POWER_CHART_Y_RANGE.maxKw;
  const zeroY = pad.top + ((maxY - 0) / (maxY - minY)) * innerHeight;
  const selectedUnit = isAggregateSegment
    ? getAggregateChartUnit(series)
    : "kW";
  const selectedValues = getSelectedChartValues({
    series,
    segment,
    selectedIndex,
    maxIndex: selectedMaxIndex,
    aggregateStacks,
  });
  const selectedLabel = getSelectedChartLabel({
    t,
    segment,
    selectedIndex,
    maxIndex: selectedMaxIndex,
    yearRange,
  });
  const selectedInfoRows = getSelectedInfoConfig().map((item) => {
    if (item.key === "soc") {
      return {
        ...item,
        value: socValue,
        percent: selectedDataPercentages.soc ?? socValue,
      };
    }

    const value = selectedValues[item.key] || 0;

    return {
      ...item,
      value,
      percent: selectedDataPercentages[item.key] ?? null,
    };
  });
  const selectedDateText = getSelectedDateText(
    selectedDay,
    selectedMonth,
    selectedYear,
  );
  //===== (handleSaveDailyCsv) ======
  const handleSaveDailyCsv = useCallback(async () => {
    if (segment !== "day") {
      Alert.alert(t("saveAsCsv"), t("dailyCsvOnly"));
      return;
    }

    try {
      setIsSavingCsv(true);
      await shareDailyChartCsv({
        series,
        dateText: selectedDateText,
        unavailableMessage: t("csvUnavailable"),
      });
      Alert.alert(t("saveAsCsv"), t("csvSaved"));
    } catch (error) {
      Alert.alert(
        t("csvFailed"),
        error?.message || "CSV belum bisa dibuat saat ini.",
      );
    } finally {
      setIsSavingCsv(false);
    }
  }, [segment, selectedDateText, series, t]);
  const gradientSuffix = isLandscapeMode ? "Landscape" : "Portrait";
  //===== (clearChartIdleTimer) ======
  const clearChartIdleTimer = useCallback(() => {
    if (chartIdleTimerRef.current) {
      clearTimeout(chartIdleTimerRef.current);
      chartIdleTimerRef.current = null;
    }
  }, []);
  //===== (returnChartToDefaultIndex) ======
  const returnChartToDefaultIndex = useCallback(() => {
    hasManualChartSelectionRef.current = false;
    setSelectedIndex(
      clampSelectedIndex(
        latestDefaultIndexRef.current,
        latestMaxIndexRef.current,
      ),
    );
  }, []);
  //===== (scheduleChartIdleReturn) ======
  const scheduleChartIdleReturn = useCallback(() => {
    clearChartIdleTimer();
    chartIdleTimerRef.current = setTimeout(() => {
      chartIdleTimerRef.current = null;
      returnChartToDefaultIndex();
    }, POWER_CHART_IDLE_RETURN_MS);
  }, [clearChartIdleTimer, returnChartToDefaultIndex]);
  //===== (setSelectedIndexFromUser) ======
  const setSelectedIndexFromUser = useCallback(
    (nextIndex) => {
      hasManualChartSelectionRef.current = true;
      setSelectedIndex(
        clampSelectedIndex(nextIndex, latestMaxIndexRef.current),
      );
      scheduleChartIdleReturn();
    },
    [scheduleChartIdleReturn],
  );
  //===== (Chart Pan Responder) ======
  const chartPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          setSelectedIndexFromUser(
            getSelectedIndexFromX(
              event.nativeEvent.locationX,
              chartGesturePad,
              innerWidth,
              selectedMaxIndex,
              segment,
            ),
          );
        },
        onPanResponderMove: (event) => {
          setSelectedIndexFromUser(
            getSelectedIndexFromX(
              event.nativeEvent.locationX,
              chartGesturePad,
              innerWidth,
              selectedMaxIndex,
              segment,
            ),
          );
        },
        onPanResponderRelease: scheduleChartIdleReturn,
        onPanResponderTerminate: scheduleChartIdleReturn,
      }),
    [
      chartGesturePad,
      innerWidth,
      scheduleChartIdleReturn,
      segment,
      selectedMaxIndex,
      setSelectedIndexFromUser,
    ],
  );

  //===== (syncSelectedIndex) ======
  useEffect(() => {
    hasManualChartSelectionRef.current = false;
    clearChartIdleTimer();
    setSelectedIndex(
      clampSelectedIndex(
        latestDefaultIndexRef.current,
        latestMaxIndexRef.current,
      ),
    );
  }, [clearChartIdleTimer, segment, selectedYear, selectedMonth, yearRange]);

  //===== (resetChartSelection) ======
  useEffect(() => {
    setSelectedIndex((current) => {
      if (hasManualChartSelectionRef.current) {
        return clampSelectedIndex(current, selectedMaxIndex);
      }

      return clampSelectedIndex(
        latestDefaultIndexRef.current,
        selectedMaxIndex,
      );
    });
  }, [selectedMaxIndex]);

  //===== (clearChartIdleTimerOnUnmount) ======
  useEffect(() => clearChartIdleTimer, [clearChartIdleTimer]);

  //===== (getYForValue) ======
  const getYForValue = (value) =>
    pad.top +
    ((maxY - clampChartValue(value, minY, maxY)) / (maxY - minY)) * innerHeight;
  //===== (renderMonthBarSegment) ======
  const renderMonthBarSegment = (item, dayIndex, startValue, endValue) => {
    if (startValue === endValue) {
      return null;
    }

    const x =
      pad.left +
      ((dayIndex + 0.5) / Math.max(aggregateStacks.itemCount, 1)) * innerWidth -
      barWidth / 2;
    const yStart = getYForValue(startValue);
    const yEnd = getYForValue(endValue);

    return (
      <Rect
        key={`${item.key}-month-${dayIndex}`}
        x={x}
        y={Math.min(yStart, yEnd)}
        width={barWidth}
        height={Math.max(1, Math.abs(yEnd - yStart))}
        rx={barWidth * 0.18}
        fill={item.color}
      />
    );
  };

  return (
    <View
      style={[
        styles.chartSection,
        isLandscapeMode && styles.chartLandscapeSection,
      ]}
    >
      <View style={styles.chartCanvasWrap}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            {datasets.map((item) => (
              <LinearGradient
                key={`${item.key}-gradient`}
                id={`${item.key}Gradient${gradientSuffix}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <Stop offset="0" stopColor={item.color} stopOpacity="0.28" />
                <Stop offset="1" stopColor={item.color} stopOpacity="0" />
              </LinearGradient>
            ))}
          </Defs>

          <SvgText
            x={4}
            y={26}
            fontSize={POWER_CHART_LAYOUT.axisTitleFontSize}
            fill={chartTextColor}
            fontWeight="500"
            textAnchor="start"
          >
            {selectedUnit}
          </SvgText>

          <SvgText
            x={chartWidth - 4}
            y={26}
            fontSize={POWER_CHART_LAYOUT.axisTitleFontSize}
            fill={chartTextColor}
            fontWeight="500"
            textAnchor="end"
          >
            {t("percentage")}
          </SvgText>

          {yTicks.map((value) => {
            const y = pad.top + ((maxY - value) / (maxY - minY)) * innerHeight;

            const percentageBase = isAggregateSegment
              ? Math.max(Math.abs(maxY), Math.abs(minY), 1)
              : POWER_CHART_Y_RANGE.maxKw;

            const percentage = Math.round((value / percentageBase) * 100);

            return (
              <Fragment key={`chart-y-${value}`}>
                <Line
                  x1={pad.left}
                  y1={y}
                  x2={chartWidth - pad.right}
                  y2={y}
                  stroke={chartGridColor}
                  strokeWidth="1"
                />

                <SvgText
                  x={pad.left - 8}
                  y={y + 5}
                  fontSize={POWER_CHART_LAYOUT.axisLabelFontSize}
                  fill={chartMutedColor}
                  textAnchor="end"
                >
                  {value.toFixed(1)}
                </SvgText>

                <SvgText
                  x={chartWidth - pad.right + 8}
                  y={y + 5}
                  fontSize={POWER_CHART_LAYOUT.axisLabelFontSize}
                  fill={chartMutedColor}
                  textAnchor="start"
                >
                  {percentage}%
                </SvgText>
              </Fragment>
            );
          })}

          {(isAggregateSegment ? aggregateTicks : timeTicks).map(
            (tick, tickIndex) => {
              const aggregateTickPosition =
                segment === "lifetime" ? tickIndex + 1 : tick;
              const x = isAggregateSegment
                ? pad.left +
                  ((aggregateTickPosition - 0.5) /
                    Math.max(aggregateStacks.itemCount, 1)) *
                    innerWidth
                : pad.left + (tick / 24) * innerWidth;

              return (
                <Fragment key={`chart-x-${tick}`}>
                  <Line
                    x1={x}
                    y1={pad.top}
                    x2={x}
                    y2={chartHeight - pad.bottom}
                    stroke={chartSubGridColor}
                    strokeWidth="1"
                  />

                  <SvgText
                    x={x}
                    y={chartHeight - 12}
                    fontSize={timeLabelFontSize}
                    fill={chartMutedColor}
                    textAnchor="middle"
                  >
                    {isAggregateSegment ? tick : formatChartHour(tick)}
                  </SvgText>
                </Fragment>
              );
            },
          )}

          {isAggregateSegment && (
            <Line
              x1={pad.left}
              y1={zeroY}
              x2={chartWidth - pad.right}
              y2={zeroY}
              stroke={chartStrongLineColor}
              strokeWidth="1.2"
            />
          )}

          {!isAggregateSegment && showCurrentTime && (
            <Line
              x1={currentTimeX}
              y1={pad.top}
              x2={currentTimeX}
              y2={chartHeight - pad.bottom}
              stroke="rgba(147,197,253,0.62)"
              strokeWidth="1.4"
              strokeDasharray="7 7"
            />
          )}

          {isAggregateSegment &&
            Array.from({ length: aggregateStacks.itemCount }, (_, dayIndex) => {
              let positiveStack = 0;
              let negativeStack = 0;

              return (
                <Fragment key={`month-bars-${dayIndex}`}>
                  {activeConsumptionDatasets.map((item) => {
                    const value = Math.min(
                      Math.abs(
                        aggregateStacks.values[item.key]?.[dayIndex] || 0,
                      ),
                      Math.max(0, maxY - positiveStack),
                    );
                    const startValue = positiveStack;
                    const endValue = positiveStack + Math.max(0, value);

                    positiveStack = endValue;
                    return renderMonthBarSegment(
                      item,
                      dayIndex,
                      startValue,
                      endValue,
                    );
                  })}
                  {activeProductionDatasets.map((item) => {
                    const value = Math.min(
                      Math.abs(
                        aggregateStacks.values[item.key]?.[dayIndex] || 0,
                      ),
                      Math.max(0, Math.abs(minY) - Math.abs(negativeStack)),
                    );
                    const startValue = negativeStack;
                    const endValue = negativeStack - Math.max(0, value);

                    negativeStack = endValue;
                    return renderMonthBarSegment(
                      item,
                      dayIndex,
                      startValue,
                      endValue,
                    );
                  })}
                </Fragment>
              );
            })}

          {!isAggregateSegment &&
            activeDatasets.map((item) => (
              <Path
                key={`${item.key}-area`}
                d={buildSmoothAreaPath(
                  item.data,
                  minY,
                  maxY,
                  chartWidth,
                  chartHeight,
                  pad,
                )}
                fill={`url(#${item.key}Gradient${gradientSuffix})`}
              />
            ))}

          {!isAggregateSegment &&
            activeDatasets.map((item) => (
              <Path
                key={`${item.key}-line`}
                d={buildSmoothLinePath(
                  item.data,
                  minY,
                  maxY,
                  chartWidth,
                  chartHeight,
                  pad,
                )}
                stroke={item.color}
                strokeWidth={POWER_CHART_LAYOUT.lineStrokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}

          {!isAggregateSegment &&
            activeDatasets.map((item) => {
              const point = getLatestChartPoint(
                item.data,
                minY,
                maxY,
                chartWidth,
                chartHeight,
                pad,
              );

              return point ? (
                <SvgCircle
                  key={`${item.key}-current-point`}
                  cx={point.x}
                  cy={point.y}
                  r={POWER_CHART_LAYOUT.pointRadius + 1}
                  fill={item.color}
                  stroke={
                    isLightMode ? colors.bubble : "rgba(248,250,252,0.82)"
                  }
                  strokeWidth="1.4"
                />
              ) : null;
            })}
          <Line
            x1={selectedMarkerX}
            y1={pad.top}
            x2={selectedMarkerX}
            y2={chartHeight - pad.bottom}
            stroke={isLightMode ? colors.accent : POWER_CHART_MARKER.lineColor}
            strokeWidth="1.6"
            strokeDasharray="5 6"
          />
        </Svg>
        <View
          {...chartPanResponder.panHandlers}
          style={[
            styles.chartMarkerTouchArea,
            {
              width: chartWidth,
              height: chartHeight,
            },
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.chartMarkerTriangle,
              {
                left: selectedMarkerX - POWER_CHART_MARKER.triangleSize,
                top: Math.max(0, pad.top - POWER_CHART_MARKER.triangleSize - 3),
                borderLeftWidth: POWER_CHART_MARKER.triangleSize,
                borderRightWidth: POWER_CHART_MARKER.triangleSize,
                borderTopWidth: POWER_CHART_MARKER.triangleSize + 2,
                borderTopColor: isLightMode
                  ? colors.accent
                  : POWER_CHART_MARKER.color,
              },
            ]}
          />
        </View>
      </View>

      {showSwitches && (
        <View style={styles.chartSwitchRow}>
          {datasets.map((item) => {
            const isActive = visibleSeries[item.key];
            const switchLabel = getPowerSeriesLabel(item, t);

            return (
              <View key={item.key} style={styles.chartSwitchItem}>
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => onToggleSeries(item.key)}
                  style={[
                    styles.chartSwitchButton,
                    {
                      backgroundColor: isActive
                        ? `${item.color}35`
                        : isLightMode
                          ? `${item.color}18`
                          : "rgba(248,250,252,0.18)",
                      borderWidth: isLightMode ? 1 : 0,
                      borderColor: isLightMode
                        ? colors.bubbleBorder
                        : "transparent",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.chartSwitchKnob,
                      {
                        backgroundColor: isActive
                          ? `${item.color}CC`
                          : isLightMode
                            ? `${item.color}8A`
                            : "rgba(248,250,252,0.45)",
                        transform: [
                          {
                            translateX: isActive
                              ? POWER_CHART_LAYOUT.switchWidth -
                                POWER_CHART_LAYOUT.switchHeight
                              : 0,
                          },
                        ],
                      },
                    ]}
                  />
                </TouchableOpacity>
                <Text
                  style={[styles.chartSwitchLabel, { color: item.color }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                >
                  {switchLabel}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {showSwitches && (
        <View
          style={[
            styles.chartSelectedInfo,
            isLightMode && {
              backgroundColor: colors.bubble,
              borderColor: colors.bubbleBorder,
            },
          ]}
        >
          <View style={styles.chartSelectedInfoHeader}>
            <Text
              style={[styles.chartSelectedInfoTitle, { color: chartTextColor }]}
            >
              {t("selectedData")}
            </Text>
            <Text
              style={[styles.chartSelectedInfoMeta, { color: colors.textSoft }]}
            >
              {segment === "day"
                ? `${t("time")}: ${selectedLabel}`
                : segment === "month"
                  ? `${t("date")}: ${selectedLabel.replace(`${t("date")} `, "")}`
                  : segment === "year"
                    ? `${t("month")}: ${selectedLabel}`
                    : `${t("year")}: ${selectedLabel}`}
            </Text>
          </View>

          <View style={styles.chartSelectedInfoGrid}>
            {selectedInfoRows.map((item) => (
              <View key={item.key} style={styles.chartSelectedInfoItem}>
                <View
                  style={[
                    styles.chartSelectedInfoDot,
                    { backgroundColor: item.color },
                  ]}
                />
                <Text
                  style={[
                    styles.chartSelectedInfoLabel,
                    {
                      color:
                        item.key === "soc"
                          ? isLightMode
                            ? "#A16207"
                            : item.color
                          : colors.textMuted,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {getPowerSeriesLabel(item, t)}
                </Text>
                <Text
                  style={[
                    styles.chartSelectedInfoValue,
                    {
                      color:
                        item.key === "soc"
                          ? isLightMode
                            ? "#A16207"
                            : item.color
                          : colors.text,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.key === "soc"
                    ? formatSocPercentValue(item.value)
                    : `${formatSelectedChartValue(
                        item.value,
                        selectedUnit,
                      )} ${selectedUnit} (${formatSelectedChartPercent(
                        item.percent,
                      )}%)`}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.82}
            disabled={isSavingCsv}
            onPress={handleSaveDailyCsv}
            style={[
              styles.chartSavePdfButton,
              { backgroundColor: colors.accent },
              isSavingCsv && styles.chartSavePdfButtonDisabled,
            ]}
          >
            {isSavingCsv ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="save-outline" size={16} color="#FFFFFF" />
            )}
            <Text style={[styles.chartSavePdfText, { color: "#FFFFFF" }]}>
              {isSavingCsv ? t("saving") : t("saveAsCsv")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
