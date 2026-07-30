//===== (Imports) ======

import React from "react";
import { Pressable, Text, View } from "react-native";

import {
  POWER_FLOW_FONT_SIZE,
  POWER_FLOW_LAYOUT,
  POWER_FLOW_SEGMENT_LABEL_CONFIG,
} from "./constants";
import styles from "./styles";
import { getActiveGlowStyle, scaleValue } from "./utils";

//===== (MetricBlock) ======

export default function MetricBlock({
  segmentKey,
  metricKey,
  icon,
  title,
  value,
  percent,
  color,
  subtitle,
  layoutScale,
  fontScale,
  selected = false,
  onPress,
  textColor = "#FFFFFF",
  mutedTextColor = "#D7DDE6",
}) {
  const labelConfig =
    POWER_FLOW_SEGMENT_LABEL_CONFIG[segmentKey] ||
    POWER_FLOW_SEGMENT_LABEL_CONFIG.pv;
  const font = POWER_FLOW_FONT_SIZE[metricKey] || POWER_FLOW_FONT_SIZE.pv;
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={[
        styles.metricBlock,
        {
          width: scaleValue(POWER_FLOW_LAYOUT.metricBlockWidth, layoutScale),
          height: scaleValue(POWER_FLOW_LAYOUT.metricBlockHeight, layoutScale),
          transform: [{ scale: selected ? 1.08 : 1 }],
        },
        getActiveGlowStyle(color, selected),
      ]}
    >
      <View
        style={[
          styles.metricIcon,
          {
            height: scaleValue(POWER_FLOW_LAYOUT.metricIconHeight, layoutScale),
            marginBottom: scaleValue(
              POWER_FLOW_LAYOUT.metricIconMarginBottom,
              layoutScale,
            ),
            transform: [{ translateY: labelConfig.iconOffsetY * layoutScale }],
          },
        ]}
      >
        {icon}
      </View>

      <View
        style={[
          styles.metricTitleSlot,
          {
            height: scaleValue(
              POWER_FLOW_LAYOUT.metricTitleHeight,
              layoutScale,
            ),
          },
        ]}
      >
        <Text
          style={[
            styles.metricTitle,
            {
              color: textColor,
              fontSize: labelConfig.nameFontSize * fontScale,
              lineHeight: font.titleLineHeight * fontScale,
              transform: [
                { translateY: labelConfig.nameOffsetY * layoutScale },
              ],
            },
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {title}
        </Text>
      </View>

      <View
        style={[
          styles.metricValueSlot,
          {
            height: scaleValue(
              POWER_FLOW_LAYOUT.metricValueHeight,
              layoutScale,
            ),
            marginTop: scaleValue(
              POWER_FLOW_LAYOUT.metricValueMarginTop,
              layoutScale,
            ),
            transform: [
              { translateX: font.valueOffsetX * layoutScale },
              {
                translateY:
                  (font.valueOffsetY + labelConfig.valueOffsetY) * layoutScale,
              },
            ],
          },
        ]}
      >
        <Text
          style={[
            styles.metricValue,
            {
              color,
              fontSize: labelConfig.valueFontSize * fontScale,
              lineHeight: font.valueLineHeight * fontScale,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
          <Text
            style={[
              styles.metricUnit,
              { color, fontSize: labelConfig.unitFontSize * fontScale },
            ]}
          >
            kWh
          </Text>
        </Text>
      </View>

      <Text
        style={[
          styles.metricPercent,
          {
            color: textColor,
            fontSize: labelConfig.percentFontSize * fontScale,
            lineHeight: (labelConfig.percentFontSize + 4) * fontScale,
            transform: [
              { translateY: labelConfig.percentOffsetY * layoutScale },
            ],
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {percent}
      </Text>

      {!!subtitle && (
        <Text style={[styles.metricSubtitle, { color: mutedTextColor }]}>
          {subtitle}
        </Text>
      )}
    </Container>
  );
}
