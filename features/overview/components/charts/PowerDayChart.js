//========== IMPORTS ==========
import { appColors } from "@/config/theme";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useEffect, useMemo, useState } from "react";
import { PanResponder, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import {
  DAY_SERIES_CONFIG,
  POWER_CHART_LAYOUT,
  POWER_SERIES_CONFIG,
} from "../../constants/overviewConstants";
import {
  formatAxisValue,
  formatChartTime,
  formatPower,
} from "../../utils/chartFormat";
import { getResponsiveChartTimeTicks } from "../../utils/chartData";
import {
  buildLinePath,
  findNearestDataPoint,
  findNearestTimestamp,
  getDayTimeRange,
  normalizeDayPowerSeries,
} from "../../utils/chartPresentation";
import { calculateYAxisRange } from "../../utils/chartScale";
import ChartLegend from "./ChartLegend";
import ChartTooltip from "./ChartTooltip";
import styles from "./chart.styles";

//========== CONSTANTS ==========
const DEFAULT_HEIGHT = 286;
const TOOLTIP_WIDTH = 148;
const SOC_TICKS = [0, 25, 50, 75, 100];

//========== COMPONENT ==========
export default function PowerDayChart({
  chartHeight = DEFAULT_HEIGHT,
  chartWidth,
  currentTime,
  mode = "portrait",
  onToggleSeries,
  selectedDay,
  selectedMonth,
  selectedYear,
  series,
  showCurrentTime = true,
  showLegend = true,
  visibleSeries,
}) {
  const { colors, t, themeMode } = useAppSettings();
  const isLightMode = themeMode === "light";
  const normalizedData = useMemo(
    () => normalizeDayPowerSeries(series),
    [series],
  );
  const activeSeries = DAY_SERIES_CONFIG.filter(
    (item) => visibleSeries[item.key],
  );
  const isSocVisible = visibleSeries.soc === true;
  const pad = mode === "landscape"
    ? { top: 24, right: isSocVisible ? 48 : 18, bottom: 32, left: 48 }
    : {
        top: POWER_CHART_LAYOUT.paddingTop,
        right: isSocVisible ? 44 : POWER_CHART_LAYOUT.paddingRight,
        bottom: POWER_CHART_LAYOUT.paddingBottom,
        left: POWER_CHART_LAYOUT.paddingLeft,
      };
  const innerWidth = Math.max(1, chartWidth - pad.left - pad.right);
  const innerHeight = Math.max(1, chartHeight - pad.top - pad.bottom);
  const powerValues = POWER_SERIES_CONFIG.filter(
    (item) => visibleSeries[item.key],
  ).flatMap((item) =>
    (normalizedData[item.key] || []).map((point) => point.value),
  );
  const chartRange = useMemo(
    () => calculateYAxisRange(powerValues),
    [powerValues],
  );
  const { startTimestamp, endTimestamp } = useMemo(
    () => getDayTimeRange(selectedDay, selectedMonth, selectedYear),
    [selectedDay, selectedMonth, selectedYear],
  );
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);

  //========== CHART SCALE ==========
  const getX = (timestamp) =>
    pad.left +
    ((timestamp - startTimestamp) / (endTimestamp - startTimestamp)) * innerWidth;
  const getPowerY = (value) =>
    pad.top +
    ((chartRange.max - value) / (chartRange.max - chartRange.min)) * innerHeight;
  const getSocY = (value) => pad.top + ((100 - value) / 100) * innerHeight;
  const getSeriesY = (key, value) =>
    key === "soc" ? getSocY(value) : getPowerY(value);
  const timeTicks = getResponsiveChartTimeTicks(innerWidth);

  //========== DATA PROCESSING ==========
  const paths = activeSeries.map((item) => ({
    ...item,
    points: (normalizedData[item.key] || [])
      .filter(
        (point) =>
          point.timestamp >= startTimestamp && point.timestamp <= endTimestamp,
      )
      .map((point) => ({
        ...point,
        x: getX(point.timestamp),
        y: getSeriesY(item.key, point.value),
      })),
  }));
  const selectedRows = selectedTimestamp === null
    ? []
    : activeSeries.map((item) => {
        const point = findNearestDataPoint(
          normalizedData[item.key],
          selectedTimestamp,
        );

        return {
          ...item,
          point,
          label: t(item.labelKey) || item.label,
          value: item.key === "soc"
            ? Number.isFinite(point?.value)
              ? `${point.value.toFixed(1)}%`
              : "No data"
            : formatPower(point?.value),
        };
      });
  const selectedMarkerX = selectedTimestamp === null
    ? null
    : getX(selectedTimestamp);
  const tooltipLeft = selectedMarkerX === null
    ? 0
    : selectedMarkerX > chartWidth / 2
      ? Math.max(2, selectedMarkerX - TOOLTIP_WIDTH - 10)
      : Math.min(chartWidth - TOOLTIP_WIDTH - 2, selectedMarkerX + 10);

  //========== CURRENT TIME ==========
  const now = currentTime || new Date();
  const isSelectedToday =
    now.getDate() === selectedDay &&
    now.getMonth() + 1 === selectedMonth &&
    now.getFullYear() === selectedYear;
  const currentTimeX = getX(now.getTime());

  //========== EVENT HANDLERS ==========
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const progress = Math.min(
            Math.max(event.nativeEvent.locationX / innerWidth, 0),
            1,
          );
          const targetTimestamp =
            startTimestamp + progress * (endTimestamp - startTimestamp);
          setSelectedTimestamp(
            findNearestTimestamp(normalizedData, visibleSeries, targetTimestamp),
          );
        },
        onPanResponderMove: (event) => {
          const progress = Math.min(
            Math.max(event.nativeEvent.locationX / innerWidth, 0),
            1,
          );
          const targetTimestamp =
            startTimestamp + progress * (endTimestamp - startTimestamp);
          setSelectedTimestamp(
            findNearestTimestamp(normalizedData, visibleSeries, targetTimestamp),
          );
        },
      }),
    [endTimestamp, innerWidth, normalizedData, startTimestamp, visibleSeries],
  );

  useEffect(() => {
    setSelectedTimestamp(null);
  }, [selectedDay, selectedMonth, selectedYear]);

  //========== RENDER HELPERS ==========
  const textColor = isLightMode ? colors.text : appColors.text;
  const mutedColor = colors.textMuted;
  const gridColor = isLightMode
    ? "rgba(8,174,234,0.15)"
    : "rgba(248,250,252,0.11)";
  const zeroColor = isLightMode
    ? "rgba(15,23,42,0.58)"
    : "rgba(248,250,252,0.5)";

  return (
    <View>
      <View style={[styles.canvas, { width: chartWidth, height: chartHeight }]}>
        <Svg width={chartWidth} height={chartHeight}>
          <SvgText x={4} y={14} fontSize={12} fontWeight="700" fill={textColor}>
            Power (kW)
          </SvgText>
          {isSocVisible && (
            <SvgText
              x={chartWidth - 4}
              y={14}
              fontSize={12}
              fontWeight="700"
              textAnchor="end"
              fill={textColor}
            >
              SoC (%)
            </SvgText>
          )}

          {chartRange.ticks.map((tick) => (
            <Line
              key={`grid-${tick}`}
              x1={pad.left}
              y1={getPowerY(tick)}
              x2={chartWidth - pad.right}
              y2={getPowerY(tick)}
              stroke={tick === 0 ? zeroColor : gridColor}
              strokeWidth={tick === 0 ? 1.5 : 1}
            />
          ))}
          {chartRange.ticks.map((tick) => (
            <SvgText
              key={`power-label-${tick}`}
              x={pad.left - 7}
              y={getPowerY(tick) + 4}
              fontSize={10}
              textAnchor="end"
              fill={mutedColor}
            >
              {formatAxisValue(tick)}
            </SvgText>
          ))}
          {isSocVisible &&
            SOC_TICKS.map((tick) => (
              <SvgText
                key={`soc-label-${tick}`}
                x={chartWidth - pad.right + 7}
                y={getSocY(tick) + 4}
                fontSize={10}
                textAnchor="start"
                fill={mutedColor}
              >
                {tick}
              </SvgText>
            ))}

          {timeTicks.map((hour) => (
            <SvgText
              key={`time-${hour}`}
              x={pad.left + (hour / 24) * innerWidth}
              y={chartHeight - 8}
              fontSize={10}
              textAnchor="middle"
              fill={mutedColor}
            >
              {String(hour).padStart(2, "0")}
            </SvgText>
          ))}

          {showCurrentTime && isSelectedToday && (
            <>
              <Line
                x1={currentTimeX}
                y1={pad.top}
                x2={currentTimeX}
                y2={chartHeight - pad.bottom}
                stroke="rgba(14,165,233,0.72)"
                strokeWidth={1.2}
                strokeDasharray="5 5"
              />
              <SvgText
                x={Math.min(currentTimeX + 4, chartWidth - pad.right - 22)}
                y={pad.top + 11}
                fontSize={9}
                fill={colors.accent}
              >
                Now
              </SvgText>
            </>
          )}

          {paths.map((item) => (
            <Path
              key={item.key}
              d={buildLinePath(item.points)}
              fill="none"
              stroke={item.color}
              strokeWidth={item.key === "soc" ? 1.8 : 2}
              strokeDasharray={item.key === "soc" ? "6 5" : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {selectedMarkerX !== null && (
            <Line
              x1={selectedMarkerX}
              y1={pad.top}
              x2={selectedMarkerX}
              y2={chartHeight - pad.bottom}
              stroke={colors.accent}
              strokeWidth={1.2}
              strokeDasharray="4 4"
            />
          )}
          {selectedRows.map((row) =>
            row.point ? (
              <Circle
                key={`point-${row.key}`}
                cx={getX(row.point.timestamp)}
                cy={getSeriesY(row.key, row.point.value)}
                r={3.5}
                fill={row.color}
                stroke={colors.bubble}
                strokeWidth={1.5}
              />
            ) : null,
          )}
        </Svg>

        <View
          {...panResponder.panHandlers}
          style={[
            styles.gestureLayer,
            {
              left: pad.left,
              top: pad.top,
              width: innerWidth,
              height: innerHeight,
            },
          ]}
        />
        <ChartTooltip
          colors={colors}
          left={tooltipLeft}
          rows={selectedRows}
          title={formatChartTime(selectedTimestamp)}
          top={pad.top + 8}
        />
      </View>

      {showLegend && (
        <ChartLegend
          colors={colors}
          config={DAY_SERIES_CONFIG}
          onToggleSeries={onToggleSeries}
          t={t}
          visibleSeries={visibleSeries}
        />
      )}
    </View>
  );
}
