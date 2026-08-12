//========== IMPORTS ==========
import { useAppSettings } from "@/context/AppSettingsContext";
import { useEffect, useMemo, useState } from "react";
import { PanResponder, ScrollView, Text, View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";
import { ENERGY_SERIES_CONFIG } from "../../constants/overviewConstants";
import {
  formatAxisValue,
  formatEnergy,
  getEnergyDisplayScale,
} from "../../utils/chartFormat";
import {
  buildAggregateChartData,
  getChartDataUnit,
} from "../../utils/chartPresentation";
import {
  calculateYAxisRange,
  getAggregateValues,
} from "../../utils/chartScale";
import ChartLegend from "./ChartLegend";
import ChartTooltip from "./ChartTooltip";
import styles from "./chart.styles";

//========== CONSTANTS ==========
const DEFAULT_HEIGHT = 286;
const TOOLTIP_WIDTH = 148;
const MONTH_SCROLL_SLOT_WIDTH = 18;

//========== COMPONENT ==========
export default function EnergyBarChart({
  chartHeight = DEFAULT_HEIGHT,
  chartWidth,
  mode = "portrait",
  onToggleSeries,
  segment,
  selectedMonth,
  selectedYear,
  series,
  showLegend = true,
  visibleSeries,
  yearRange,
}) {
  const { colors, t } = useAppSettings();
  const pad = mode === "landscape"
    ? { top: 24, right: 18, bottom: 34, left: 52 }
    : { top: 24, right: 12, bottom: 36, left: 48 };
  const rawItems = useMemo(
    () =>
      buildAggregateChartData({
        series,
        segment,
        selectedYear,
        selectedMonth,
        yearRange,
      }),
    [segment, selectedMonth, selectedYear, series, yearRange],
  );
  const availableConfig = ENERGY_SERIES_CONFIG.filter((config) =>
    rawItems.some((item) => Number.isFinite(item[config.key])),
  );
  const activeConfig = ENERGY_SERIES_CONFIG.filter(
    (item) => visibleSeries[item.key],
  );
  const needsHorizontalScroll =
    mode === "portrait" && segment === "month" && activeConfig.length >= 3;
  const plotWidth = needsHorizontalScroll
    ? Math.max(
        chartWidth,
        pad.left + pad.right + rawItems.length * MONTH_SCROLL_SLOT_WIDTH,
      )
    : chartWidth;
  const innerWidth = Math.max(1, plotWidth - pad.left - pad.right);
  const innerHeight = Math.max(1, chartHeight - pad.top - pad.bottom);
  const rawValues = getAggregateValues(
    rawItems,
    ENERGY_SERIES_CONFIG.map((item) => item.key),
  );
  const displayScale = getEnergyDisplayScale(
    rawValues,
    getChartDataUnit(series),
  );
  const items = rawItems.map((item) =>
    ENERGY_SERIES_CONFIG.reduce(
      (normalizedItem, config) => ({
        ...normalizedItem,
        [config.key]: Number.isFinite(item[config.key])
          ? item[config.key] / displayScale.divisor
          : undefined,
      }),
      { label: item.label },
    ),
  );
  const visibleValues = getAggregateValues(
    items,
    activeConfig.map((item) => item.key),
  );
  const chartRange = calculateYAxisRange(visibleValues);
  const [selectedIndex, setSelectedIndex] = useState(null);

  //========== CHART SCALE ==========
  const slotWidth = innerWidth / Math.max(items.length, 1);
  const groupWidth = Math.min(slotWidth * 0.78, 42);
  const barGap = activeConfig.length > 1 ? 1.5 : 0;
  const barWidth = Math.max(
    1.5,
    (groupWidth - barGap * Math.max(0, activeConfig.length - 1)) /
      Math.max(activeConfig.length, 1),
  );
  const getY = (value) =>
    pad.top +
    ((chartRange.max - value) / (chartRange.max - chartRange.min)) * innerHeight;
  const baselineY = getY(0);
  const selectedMarkerX = selectedIndex === null
    ? null
    : pad.left + (selectedIndex + 0.5) * slotWidth;
  const tooltipLeft = selectedMarkerX === null
    ? 0
    : selectedMarkerX > plotWidth / 2
      ? Math.max(2, selectedMarkerX - TOOLTIP_WIDTH - 10)
      : Math.min(plotWidth - TOOLTIP_WIDTH - 2, selectedMarkerX + 10);
  const tickStep =
    segment === "month" ? (innerWidth < 280 ? 5 : 3) : segment === "year" ? 2 : 1;
  const visibleLabelIndexes = items
    .map((_, index) => index)
    .filter(
      (index) => index % tickStep === 0 || index === items.length - 1,
    );

  //========== DATA PROCESSING ==========
  const selectedItem = selectedIndex === null ? null : items[selectedIndex];
  const tooltipRows = selectedItem
    ? activeConfig.map((config) => ({
        ...config,
        label: t(config.labelKey) || config.label,
        value: formatEnergy(selectedItem[config.key], displayScale.unit),
      }))
    : [];
  const summary = availableConfig.map((config) => {
    const values = items
      .map((item) => item[config.key])
      .filter(Number.isFinite);

    return {
      ...config,
      value: values.length
        ? values.reduce((total, value) => total + value, 0)
        : null,
    };
  });

  //========== EVENT HANDLERS ==========
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => !needsHorizontalScroll,
        onPanResponderGrant: (event) => {
          const nextIndex = Math.min(
            items.length - 1,
            Math.max(0, Math.floor(event.nativeEvent.locationX / slotWidth)),
          );
          setSelectedIndex(nextIndex);
        },
        onPanResponderMove: (event) => {
          if (needsHorizontalScroll) {
            return;
          }

          const nextIndex = Math.min(
            items.length - 1,
            Math.max(0, Math.floor(event.nativeEvent.locationX / slotWidth)),
          );
          setSelectedIndex(nextIndex);
        },
      }),
    [items.length, needsHorizontalScroll, slotWidth],
  );

  useEffect(() => {
    setSelectedIndex(null);
  }, [segment, selectedMonth, selectedYear]);

  //========== RENDER HELPERS ==========
  const gridColor = "rgba(148,163,184,0.18)";
  const chartCanvas = (
    <View style={[styles.canvas, { width: plotWidth, height: chartHeight }]}>
      <Svg width={plotWidth} height={chartHeight}>
        <SvgText x={4} y={14} fontSize={12} fontWeight="700" fill={colors.text}>
          Energy ({displayScale.unit})
        </SvgText>

        {chartRange.ticks.map((tick) => (
          <Line
            key={`grid-${tick}`}
            x1={pad.left}
            y1={getY(tick)}
            x2={plotWidth - pad.right}
            y2={getY(tick)}
            stroke={tick === 0 ? colors.textMuted : gridColor}
            strokeWidth={tick === 0 ? 1.4 : 1}
          />
        ))}
        {chartRange.ticks.map((tick) => (
          <SvgText
            key={`y-${tick}`}
            x={pad.left - 7}
            y={getY(tick) + 4}
            fontSize={10}
            textAnchor="end"
            fill={colors.textMuted}
          >
            {formatAxisValue(tick)}
          </SvgText>
        ))}

        {items.flatMap((item, itemIndex) =>
          activeConfig.map((config, configIndex) => {
            const value = item[config.key];

            if (!Number.isFinite(value) || value === 0) {
              return null;
            }

            const groupStart =
              pad.left +
              itemIndex * slotWidth +
              (slotWidth - groupWidth) / 2;
            const x = groupStart + configIndex * (barWidth + barGap);
            const valueY = getY(value);

            return (
              <Rect
                key={`${config.key}-${itemIndex}`}
                x={x}
                y={Math.min(valueY, baselineY)}
                width={barWidth}
                height={Math.max(1, Math.abs(baselineY - valueY))}
                rx={Math.min(2, barWidth / 2)}
                fill={config.color}
              />
            );
          }),
        )}

        {visibleLabelIndexes.map((index) => (
          <SvgText
            key={`x-${index}`}
            x={pad.left + (index + 0.5) * slotWidth}
            y={chartHeight - 9}
            fontSize={segment === "lifetime" ? 9 : 9.5}
            textAnchor="middle"
            fill={colors.textMuted}
          >
            {items[index].label}
          </SvgText>
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
        rows={tooltipRows}
        title={selectedItem?.label || ""}
        top={pad.top + 8}
      />
    </View>
  );

  return (
    <View>
      {needsHorizontalScroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ width: chartWidth }}
        >
          {chartCanvas}
        </ScrollView>
      ) : (
        chartCanvas
      )}

      {showLegend && (
        <ChartLegend
          colors={colors}
          config={ENERGY_SERIES_CONFIG}
          onToggleSeries={onToggleSeries}
          t={t}
          visibleSeries={visibleSeries}
        />
      )}

      {showLegend && summary.length > 0 && (
        <View style={styles.summaryRow}>
          {summary.map((item) => (
            <View
              key={item.key}
              style={[
                styles.summaryItem,
                {
                  backgroundColor: `${item.color}12`,
                  borderColor: colors.bubbleBorder,
                },
              ]}
            >
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                {t(item.labelKey) || item.label}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatEnergy(item.value, displayScale.unit)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
