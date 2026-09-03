//===== (Imports) ======

import React, { useState } from "react";
import {
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { useAppSettings } from "@/context/AppSettingsContext";

import MetricBlock from "./MetricBlock";
import {
  POWER_FLOW_CENTER_TEXT_CONFIG,
  POWER_FLOW_COLORS,
  POWER_FLOW_FONT_SIZE,
  POWER_FLOW_LAYOUT,
  POWER_FLOW_RING,
  POWER_FLOW_SEGMENT_LABEL_CONFIG,
  POWER_FLOW_SEGMENTS,
  PRODUCTION_FLOW_COLORS,
} from "./constants";
import styles from "./styles";
import {
  formatPercent,
  formatValue,
  getActiveGlowStyle,
  getRingDashArray,
  getRingRotation,
  getRingSegmentRatios,
  getRingStrokeWidth,
  getSafeRingValue,
  getSectionPercent,
  scaleValue,
} from "./utils";

//===== (PowerFlowDiagram) ======

export default function PowerFlowDiagram({ data = {}, variant = "default" }) {
  const { colors: themeColors, t, themeMode } = useAppSettings();
  const [selectedFlow, setSelectedFlow] = useState(null);
  const { width } = useWindowDimensions();
  const isProductionVariant = variant === "production";
  const copy = isProductionVariant
    ? {
        centerTitle: t("production"),
        pvTitle: t("pvGenerate"),
        gridTitle: t("export"),
        batteryTitle: t("charge"),
      }
    : {
        centerTitle: t("consumption"),
        pvTitle: t("pv"),
        gridTitle: t("grid"),
        batteryTitle: t("battery"),
      };
  const colors = isProductionVariant ? PRODUCTION_FLOW_COLORS : POWER_FLOW_COLORS;
  const energy = data.energy || {};
  const productionFlow = data.productionFlow || {};
  const consumptionKwh = Number(
    isProductionVariant
      ? productionFlow.pvGenerateKwh
      : energy.consumptionKwh || 0,
  );
  const batteryKwh = Number(
    isProductionVariant ? productionFlow.chargeKwh : energy.batteryKwh || 0,
  );
  const gridKwh = Number(
    isProductionVariant ? productionFlow.exportKwh : energy.gridKwh || 0,
  );
  const rawTotalKwh = Number(
    isProductionVariant
      ? productionFlow.totalProductionKwh ??
          consumptionKwh + batteryKwh + gridKwh
      : energy.totalKwh || 0,
  );
  const totalKwh =
    Number.isFinite(rawTotalKwh) && rawTotalKwh > 0
      ? rawTotalKwh
      : getSafeRingValue(consumptionKwh) +
        getSafeRingValue(batteryKwh) +
        getSafeRingValue(gridKwh);
  const pvPercent = formatPercent(getSectionPercent(consumptionKwh, totalKwh));
  const batteryPercent = formatPercent(getSectionPercent(batteryKwh, totalKwh));
  const gridPercent = formatPercent(getSectionPercent(gridKwh, totalKwh));
  const ringSegmentRatios = getRingSegmentRatios({
    pv: consumptionKwh,
    battery: batteryKwh,
    grid: gridKwh,
  });
  const availableWidth = Math.max(304, width - 64);
  const layoutScale = Math.min(1, Math.max(0.74, availableWidth / 404));
  const fontScale = Math.min(1, Math.max(0.82, layoutScale + 0.08));
  const ringSize = scaleValue(POWER_FLOW_LAYOUT.ringSize, layoutScale);
  const centerSectionWidth = scaleValue(
    POWER_FLOW_LAYOUT.centerSectionWidth,
    layoutScale,
  );
  const sideColumnWidth = scaleValue(
    POWER_FLOW_LAYOUT.sideColumnWidth,
    layoutScale,
  );
  const iconScale = Math.min(1, Math.max(0.82, layoutScale));
  const textColor = themeMode === "light" ? themeColors.text : "#FFFFFF";
  const mutedTextColor =
    themeMode === "light" ? themeColors.textMuted : "#D7DDE6";
  const ringTrackColor =
    themeMode === "light" ? "rgba(8,174,234,0.14)" : "rgba(248,250,252,0.08)";
  //===== (selectFlow) ======
  const selectFlow = (flowKey) => (event) => {
    event?.stopPropagation?.();
    setSelectedFlow((currentFlow) =>
      currentFlow === flowKey ? null : flowKey,
    );
  };

  return (
    <Pressable
      onPress={() => setSelectedFlow(null)}
      style={[
        styles.container,
        {
          paddingHorizontal: scaleValue(
            POWER_FLOW_LAYOUT.containerPaddingHorizontal,
            layoutScale,
          ),
          minHeight: scaleValue(
            POWER_FLOW_LAYOUT.containerMinHeight,
            layoutScale,
          ),
        },
      ]}
    >
      <View
        style={[
          styles.sideColumn,
          {
            width: sideColumnWidth,
            gap: scaleValue(POWER_FLOW_LAYOUT.sideColumnGap, layoutScale),
          },
        ]}
      >
        <MetricBlock
          segmentKey="pv"
          metricKey="pv"
          icon={
            isProductionVariant ? (
              <Ionicons
                name="sunny"
                size={POWER_FLOW_SEGMENT_LABEL_CONFIG.pv.iconSize * iconScale}
                color={colors.pv}
              />
            ) : (
              <View style={styles.flashWrap}>
                <Ionicons
                  name="flash"
                  size={POWER_FLOW_SEGMENT_LABEL_CONFIG.pv.iconSize * iconScale}
                  color={colors.pv}
                />
                <Ionicons
                  name="add"
                  size={
                    POWER_FLOW_SEGMENT_LABEL_CONFIG.pv.iconSize *
                    0.37 *
                    iconScale
                  }
                  color={colors.pv}
                  style={styles.flashPlus}
                />
              </View>
            )
          }
          title={copy.pvTitle}
          value={formatValue(consumptionKwh)}
          percent={pvPercent}
          color={colors.pv}
          subtitle=""
          layoutScale={layoutScale}
          fontScale={fontScale}
          selected={selectedFlow === "pv"}
          onPress={selectFlow("pv")}
          textColor={textColor}
          mutedTextColor={mutedTextColor}
        />
      </View>

      <View style={[styles.centerSection, { width: centerSectionWidth }]}>
        <View
          style={[styles.ringWrapper, { width: ringSize, height: ringSize }]}
        >
          <Svg width={ringSize} height={ringSize} viewBox="0 0 238 238">
            <Circle
              cx="119"
              cy="119"
              r={POWER_FLOW_RING.radius}
              stroke={ringTrackColor}
              strokeWidth={POWER_FLOW_SEGMENTS.pv.strokeWidth}
              strokeLinecap="round"
              fill="none"
            />

            {selectedFlow === "pv" && (
              <Circle
                cx="119"
                cy="119"
                r={POWER_FLOW_RING.radius}
                stroke={colors.pv}
                strokeWidth={
                  POWER_FLOW_SEGMENTS.pv.activeStrokeWidth +
                  POWER_FLOW_RING.glowStrokeWidth
                }
                strokeLinecap="butt"
                fill="none"
                opacity={POWER_FLOW_RING.glowOpacity}
                strokeDasharray={getRingDashArray("pv", ringSegmentRatios)}
                transform={`rotate(${getRingRotation("pv", ringSegmentRatios)} 119 119)`}
                onPress={selectFlow("pv")}
              />
            )}

            {selectedFlow === "battery" && (
              <Circle
                cx="119"
                cy="119"
                r={POWER_FLOW_RING.radius}
                stroke={colors.battery}
                strokeWidth={
                  POWER_FLOW_SEGMENTS.battery.activeStrokeWidth +
                  POWER_FLOW_RING.glowStrokeWidth
                }
                strokeLinecap="butt"
                fill="none"
                opacity={POWER_FLOW_RING.glowOpacity}
                strokeDasharray={getRingDashArray(
                  "battery",
                  ringSegmentRatios,
                )}
                transform={`rotate(${getRingRotation("battery", ringSegmentRatios)} 119 119)`}
                onPress={selectFlow("battery")}
              />
            )}

            {selectedFlow === "grid" && (
              <Circle
                cx="119"
                cy="119"
                r={POWER_FLOW_RING.radius}
                stroke={colors.grid}
                strokeWidth={
                  POWER_FLOW_SEGMENTS.grid.activeStrokeWidth +
                  POWER_FLOW_RING.glowStrokeWidth
                }
                strokeLinecap="butt"
                fill="none"
                opacity={POWER_FLOW_RING.glowOpacity}
                strokeDasharray={getRingDashArray("grid", ringSegmentRatios)}
                transform={`rotate(${getRingRotation("grid", ringSegmentRatios)} 119 119)`}
                onPress={selectFlow("grid")}
              />
            )}

            <Circle
              cx="119"
              cy="119"
              r={POWER_FLOW_RING.radius}
              stroke={colors.pv}
              strokeWidth={getRingStrokeWidth("pv", selectedFlow === "pv")}
              strokeLinecap="butt"
              fill="none"
              strokeDasharray={getRingDashArray("pv", ringSegmentRatios)}
              transform={`rotate(${getRingRotation("pv", ringSegmentRatios)} 119 119)`}
              onPress={selectFlow("pv")}
            />

            <Circle
              cx="119"
              cy="119"
              r={POWER_FLOW_RING.radius}
              stroke={colors.battery}
              strokeWidth={getRingStrokeWidth(
                "battery",
                selectedFlow === "battery",
              )}
              strokeLinecap="butt"
              fill="none"
              strokeDasharray={getRingDashArray("battery", ringSegmentRatios)}
              transform={`rotate(${getRingRotation("battery", ringSegmentRatios)} 119 119)`}
              onPress={selectFlow("battery")}
            />

            <Circle
              cx="119"
              cy="119"
              r={POWER_FLOW_RING.radius}
              stroke={colors.grid}
              strokeWidth={getRingStrokeWidth("grid", selectedFlow === "grid")}
              strokeLinecap="butt"
              fill="none"
              strokeDasharray={getRingDashArray("grid", ringSegmentRatios)}
              transform={`rotate(${getRingRotation("grid", ringSegmentRatios)} 119 119)`}
              onPress={selectFlow("grid")}
            />
          </Svg>

          <View
            style={[
              styles.centerContent,
              {
                top: scaleValue(
                  POWER_FLOW_LAYOUT.centerContentTop,
                  layoutScale,
                ),
                paddingHorizontal: ringSize * 0.21,
              },
            ]}
          >
            <Text
              style={[
                styles.centerLabel,
                {
                  color: textColor,
                  fontSize: POWER_FLOW_FONT_SIZE.center.label * fontScale,
                  lineHeight:
                    POWER_FLOW_FONT_SIZE.center.labelLineHeight * fontScale,
                  transform: [
                    {
                      translateY:
                        POWER_FLOW_CENTER_TEXT_CONFIG.titleOffsetY *
                        layoutScale,
                    },
                  ],
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {copy.centerTitle}
            </Text>
            <Text
              style={[
                styles.centerValue,
                {
                  color: textColor,
                  fontSize: POWER_FLOW_FONT_SIZE.center.value * fontScale,
                  lineHeight:
                    POWER_FLOW_FONT_SIZE.center.valueLineHeight * fontScale,
                  transform: [
                    {
                      translateY:
                        POWER_FLOW_CENTER_TEXT_CONFIG.valueOffsetY *
                        layoutScale,
                    },
                  ],
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatValue(totalKwh)}
              <Text
                style={[
                  styles.centerUnit,
                  {
                    color: textColor,
                    fontSize: POWER_FLOW_FONT_SIZE.center.unit * fontScale,
                  },
                ]}
              >
                kWh
              </Text>
            </Text>
          </View>
        </View>

        <Pressable
          style={[
            styles.gridBlock,
            {
              width: scaleValue(
                POWER_FLOW_LAYOUT.gridBlockWidth,
                layoutScale,
              ),
              minHeight: scaleValue(
                POWER_FLOW_LAYOUT.gridBlockHeight,
                layoutScale,
              ),
              marginTop: scaleValue(
                POWER_FLOW_LAYOUT.gridBlockMarginTop,
                layoutScale,
              ),
              transform: [{ scale: selectedFlow === "grid" ? 1.08 : 1 }],
            },
            getActiveGlowStyle(colors.grid, selectedFlow === "grid"),
          ]}
          onPress={selectFlow("grid")}
        >
          {isProductionVariant ? (
            <Ionicons
              name="send"
              size={POWER_FLOW_SEGMENT_LABEL_CONFIG.grid.iconSize * iconScale}
              color={colors.grid}
              style={[
                {
                  marginBottom: scaleValue(
                    POWER_FLOW_LAYOUT.gridIconMarginBottom,
                    layoutScale,
                  ),
                  transform: [
                    {
                      translateY:
                        POWER_FLOW_SEGMENT_LABEL_CONFIG.grid.iconOffsetY *
                        layoutScale,
                    },
                  ],
                },
              ]}
            />
          ) : (
            <FontAwesome5
              name="broadcast-tower"
              size={POWER_FLOW_SEGMENT_LABEL_CONFIG.grid.iconSize * iconScale}
              color={colors.grid}
              style={[
                {
                  marginBottom: scaleValue(
                    POWER_FLOW_LAYOUT.gridIconMarginBottom,
                    layoutScale,
                  ),
                  transform: [
                    {
                      translateY:
                        POWER_FLOW_SEGMENT_LABEL_CONFIG.grid.iconOffsetY *
                        layoutScale,
                    },
                  ],
                },
              ]}
            />
          )}

          <Text
            style={[
              styles.gridLabel,
              {
                color: textColor,
                fontSize:
                  POWER_FLOW_SEGMENT_LABEL_CONFIG.grid.nameFontSize *
                  fontScale,
                lineHeight:
                  POWER_FLOW_FONT_SIZE.grid.titleLineHeight * fontScale,
                transform: [
                  {
                    translateY:
                      POWER_FLOW_SEGMENT_LABEL_CONFIG.grid.nameOffsetY *
                      layoutScale,
                  },
                ],
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {copy.gridTitle}
          </Text>

          <Text
            style={[
              styles.gridValue,
              {
                color: colors.grid,
                fontSize:
                  POWER_FLOW_SEGMENT_LABEL_CONFIG.grid.valueFontSize *
                  fontScale,
                lineHeight:
                  POWER_FLOW_FONT_SIZE.grid.valueLineHeight * fontScale,
                transform: [
                  {
                    translateX:
                      POWER_FLOW_FONT_SIZE.grid.valueOffsetX * layoutScale,
                  },
                  {
                    translateY:
                      (POWER_FLOW_FONT_SIZE.grid.valueOffsetY +
                        POWER_FLOW_SEGMENT_LABEL_CONFIG.grid.valueOffsetY) *
                      layoutScale,
                  },
                ],
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatValue(gridKwh)}
            <Text
              style={[
                styles.gridUnit,
                {
                  color: colors.grid,
                  fontSize:
                    POWER_FLOW_SEGMENT_LABEL_CONFIG.grid.unitFontSize *
                    fontScale,
                },
              ]}
            >
              kWh
            </Text>
          </Text>
          <Text
            style={[
              styles.gridPercent,
              {
                color: textColor,
                fontSize:
                  POWER_FLOW_SEGMENT_LABEL_CONFIG.grid.percentFontSize *
                  fontScale,
                lineHeight:
                  (POWER_FLOW_SEGMENT_LABEL_CONFIG.grid.percentFontSize + 4) *
                  fontScale,
                transform: [
                  {
                    translateY:
                      POWER_FLOW_SEGMENT_LABEL_CONFIG.grid.percentOffsetY *
                      layoutScale,
                  },
                ],
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {gridPercent}
          </Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.sideColumn,
          {
            width: sideColumnWidth,
            gap: scaleValue(POWER_FLOW_LAYOUT.sideColumnGap, layoutScale),
          },
        ]}
      >
        <MetricBlock
          segmentKey="battery"
          metricKey="battery"
          icon={
            <MaterialCommunityIcons
              name={
                isProductionVariant ? "battery-plus" : "battery-charging-high"
              }
              size={
                POWER_FLOW_SEGMENT_LABEL_CONFIG.battery.iconSize * iconScale
              }
              color={colors.battery}
            />
          }
          title={copy.batteryTitle}
          value={formatValue(batteryKwh)}
          percent={batteryPercent}
          color={colors.battery}
          subtitle=""
          layoutScale={layoutScale}
          fontScale={fontScale}
          selected={selectedFlow === "battery"}
          onPress={selectFlow("battery")}
          textColor={textColor}
          mutedTextColor={mutedTextColor}
        />
      </View>
    </Pressable>
  );
}
