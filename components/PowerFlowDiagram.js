import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

// Atur layout PowerFlowDiagram dari sini.
const POWER_FLOW_LAYOUT = {
  containerPaddingTop: 0,
  containerPaddingBottom: 0,
  containerPaddingHorizontal: 8,
  containerMinHeight: 240,
  sideColumnWidth: 76,
  sideColumnGap: 24,
  metricBlockWidth: 76,
  metricBlockHeight: 108,
  metricIconHeight: 48,
  metricIconMarginBottom: 2,
  metricTitleHeight: 30,
  metricValueHeight: 32,
  metricValueMarginTop: 3,
  centerSectionWidth: 225,
  ringSize: 238,
  centerContentTop: 76,
  gridBlockWidth: 108,
  gridBlockHeight: 78,
  gridBlockMarginTop: 12,
  gridIconMarginBottom: 4,
};

const POWER_FLOW_COLORS = {
  pv: "#1FB7FF",
  grid: "#FF9300",
  battery: "#99E500",
};

const POWER_FLOW_RING = {
  radius: 76,
  circumference: 477,
  joinOverlapAngle: 0.8,
  rotationOffset: 30,
  glowStrokeWidth: 10,
  glowOpacity: 0.22,
};

// Atur sudut, panjang, dan ketebalan warna ring PowerFlowDiagram dari sini.
const POWER_FLOW_SEGMENTS = {
  pv: {
    startAngle: 210,
    endAngle: 330,
    proportion: 0.27,
    strokeWidth: 14,
    activeStrokeWidth: 18,
  },
  battery: {
    startAngle: 330,
    endAngle: 90,
    proportion: 0.2,
    strokeWidth: 14,
    activeStrokeWidth: 18,
  },
  grid: {
    startAngle: 90,
    endAngle: 210,
    proportion: 0.3,
    strokeWidth: 14,
    activeStrokeWidth: 18,
  },
};

// Atur ukuran font setiap angka 0kW secara manual dari sini.
const POWER_FLOW_FONT_SIZE = {
  production: {
    title: 12,
    titleLineHeight: 14,
    value: 20,
    valueLineHeight: 25,
    unit: 10,
    valueOffsetX: 0,
    valueOffsetY: 0,
  },
  battery: {
    title: 12,
    titleLineHeight: 14,
    value: 20,
    valueLineHeight: 25,
    unit: 10,
    valueOffsetX: 0,
    valueOffsetY: 0,
  },
  grid: {
    title: 12,
    titleLineHeight: 14,
    value: 20,
    valueLineHeight: 25,
    unit: 10,
    valueOffsetX: 0,
    valueOffsetY: 0,
  },
  center: {
    label: 18,
    labelLineHeight: 22,
    value: 28,
    valueLineHeight: 31,
    unit: 10,
  },
};

function formatValue(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toFixed(2);
}

function scaleValue(value, scale) {
  return Math.round(value * scale);
}

function normalizeAngle(angle) {
  return ((Number(angle) % 360) + 360) % 360;
}

function getAngleSpan(startAngle, endAngle) {
  const start = normalizeAngle(startAngle);
  const end = normalizeAngle(endAngle);
  const span = end - start;

  if (start === end) {
    return 0;
  }

  return span > 0 ? span : span + 360;
}

function getRingSegmentLength(segmentKey) {
  const segment = POWER_FLOW_SEGMENTS[segmentKey] || POWER_FLOW_SEGMENTS.pv;
  const angleSpan =
    getAngleSpan(segment.startAngle, segment.endAngle) +
    POWER_FLOW_RING.joinOverlapAngle;
  const angleLength = POWER_FLOW_RING.circumference * (angleSpan / 360);
  const fallbackLength = POWER_FLOW_RING.circumference * segment.proportion;

  return Number.isFinite(angleLength) ? angleLength : fallbackLength;
}

function getRingDashArray(segmentKey) {
  const segmentLength = Math.max(0, getRingSegmentLength(segmentKey));
  const gapLength = Math.max(0, POWER_FLOW_RING.circumference - segmentLength);

  return `${segmentLength} ${gapLength}`;
}

function getRingRotation(segmentKey) {
  const segment = POWER_FLOW_SEGMENTS[segmentKey] || POWER_FLOW_SEGMENTS.pv;
  return normalizeAngle(segment.startAngle + POWER_FLOW_RING.rotationOffset) - 90;
}

function getRingStrokeWidth(segmentKey, isSelected) {
  const segment = POWER_FLOW_SEGMENTS[segmentKey] || POWER_FLOW_SEGMENTS.pv;
  return isSelected ? segment.activeStrokeWidth : segment.strokeWidth;
}

function getActiveGlowStyle(color, selected) {
  if (!selected) {
    return null;
  }

  return {
    shadowColor: color,
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  };
}

function MetricBlock({
  metricKey,
  icon,
  title,
  value,
  color,
  subtitle,
  layoutScale,
  fontScale,
  selected = false,
  onPress,
}) {
  const font =
    POWER_FLOW_FONT_SIZE[metricKey] || POWER_FLOW_FONT_SIZE.production;
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
              fontSize: font.title * fontScale,
              lineHeight: font.titleLineHeight * fontScale,
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
              { translateY: font.valueOffsetY * layoutScale },
            ],
          },
        ]}
      >
        <Text
          style={[
            styles.metricValue,
            {
              color,
              fontSize: font.value * fontScale,
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
              { color, fontSize: font.unit * fontScale },
            ]}
          >
            kWh
          </Text>
        </Text>
      </View>

      {!!subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </Container>
  );
}

export default function PowerFlowDiagram({ data = {} }) {
  const [selectedFlow, setSelectedFlow] = useState(null);
  const { width } = useWindowDimensions();
  const energy = data.energy || {};
  const consumptionKwh = Number(energy.consumptionKwh || 0);
  const batteryKwh = Number(energy.batteryKwh || 0);
  const gridKwh = Number(energy.gridKwh || 0);
  const totalKwh = Number(energy.totalKwh || 0);
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
          metricKey="production"
          icon={
            <View style={styles.flashWrap}>
              <Ionicons
                name="flash"
                size={38 * iconScale}
                color={POWER_FLOW_COLORS.pv}
              />
              <Ionicons
                name="add"
                size={14 * iconScale}
                color={POWER_FLOW_COLORS.pv}
                style={styles.flashPlus}
              />
            </View>
          }
          title={"PV"}
          value={formatValue(consumptionKwh)}
          color={POWER_FLOW_COLORS.pv}
          subtitle=""
          layoutScale={layoutScale}
          fontScale={fontScale}
          selected={selectedFlow === "pv"}
          onPress={selectFlow("pv")}
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
              stroke="rgba(248,250,252,0.08)"
              strokeWidth={POWER_FLOW_SEGMENTS.pv.strokeWidth}
              strokeLinecap="round"
              fill="none"
            />

            {selectedFlow === "pv" && (
              <Circle
                cx="119"
                cy="119"
                r={POWER_FLOW_RING.radius}
                stroke={POWER_FLOW_COLORS.pv}
                strokeWidth={
                  POWER_FLOW_SEGMENTS.pv.activeStrokeWidth +
                  POWER_FLOW_RING.glowStrokeWidth
                }
                strokeLinecap="butt"
                fill="none"
                opacity={POWER_FLOW_RING.glowOpacity}
                strokeDasharray={getRingDashArray("pv")}
                transform={`rotate(${getRingRotation("pv")} 119 119)`}
                onPress={selectFlow("pv")}
              />
            )}

            {selectedFlow === "battery" && (
              <Circle
                cx="119"
                cy="119"
                r={POWER_FLOW_RING.radius}
                stroke={POWER_FLOW_COLORS.battery}
                strokeWidth={
                  POWER_FLOW_SEGMENTS.battery.activeStrokeWidth +
                  POWER_FLOW_RING.glowStrokeWidth
                }
                strokeLinecap="butt"
                fill="none"
                opacity={POWER_FLOW_RING.glowOpacity}
                strokeDasharray={getRingDashArray("battery")}
                transform={`rotate(${getRingRotation("battery")} 119 119)`}
                onPress={selectFlow("battery")}
              />
            )}

            {selectedFlow === "grid" && (
              <Circle
                cx="119"
                cy="119"
                r={POWER_FLOW_RING.radius}
                stroke={POWER_FLOW_COLORS.grid}
                strokeWidth={
                  POWER_FLOW_SEGMENTS.grid.activeStrokeWidth +
                  POWER_FLOW_RING.glowStrokeWidth
                }
                strokeLinecap="butt"
                fill="none"
                opacity={POWER_FLOW_RING.glowOpacity}
                strokeDasharray={getRingDashArray("grid")}
                transform={`rotate(${getRingRotation("grid")} 119 119)`}
                onPress={selectFlow("grid")}
              />
            )}

            <Circle
              cx="119"
              cy="119"
              r={POWER_FLOW_RING.radius}
              stroke={POWER_FLOW_COLORS.pv}
              strokeWidth={getRingStrokeWidth("pv", selectedFlow === "pv")}
              strokeLinecap="butt"
              fill="none"
              strokeDasharray={getRingDashArray("pv")}
              transform={`rotate(${getRingRotation("pv")} 119 119)`}
              onPress={selectFlow("pv")}
            />

            <Circle
              cx="119"
              cy="119"
              r={POWER_FLOW_RING.radius}
              stroke={POWER_FLOW_COLORS.battery}
              strokeWidth={getRingStrokeWidth(
                "battery",
                selectedFlow === "battery",
              )}
              strokeLinecap="butt"
              fill="none"
              strokeDasharray={getRingDashArray("battery")}
              transform={`rotate(${getRingRotation("battery")} 119 119)`}
              onPress={selectFlow("battery")}
            />

            <Circle
              cx="119"
              cy="119"
              r={POWER_FLOW_RING.radius}
              stroke={POWER_FLOW_COLORS.grid}
              strokeWidth={getRingStrokeWidth("grid", selectedFlow === "grid")}
              strokeLinecap="butt"
              fill="none"
              strokeDasharray={getRingDashArray("grid")}
              transform={`rotate(${getRingRotation("grid")} 119 119)`}
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
                  fontSize: POWER_FLOW_FONT_SIZE.center.label * fontScale,
                  lineHeight:
                    POWER_FLOW_FONT_SIZE.center.labelLineHeight * fontScale,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Consumption
            </Text>
            <Text
              style={[
                styles.centerValue,
                {
                  fontSize: POWER_FLOW_FONT_SIZE.center.value * fontScale,
                  lineHeight:
                    POWER_FLOW_FONT_SIZE.center.valueLineHeight * fontScale,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatValue(totalKwh)}
              <Text
                style={[
                  styles.centerUnit,
                  { fontSize: POWER_FLOW_FONT_SIZE.center.unit * fontScale },
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
              height: scaleValue(
                POWER_FLOW_LAYOUT.gridBlockHeight,
                layoutScale,
              ),
              marginTop: scaleValue(
                POWER_FLOW_LAYOUT.gridBlockMarginTop,
                layoutScale,
              ),
              transform: [{ scale: selectedFlow === "grid" ? 1.08 : 1 }],
            },
            getActiveGlowStyle(POWER_FLOW_COLORS.grid, selectedFlow === "grid"),
          ]}
          onPress={selectFlow("grid")}
        >
          <FontAwesome5
            name="broadcast-tower"
            size={28 * iconScale}
            color={POWER_FLOW_COLORS.grid}
            style={{
              marginBottom: scaleValue(
                POWER_FLOW_LAYOUT.gridIconMarginBottom,
                layoutScale,
              ),
            }}
          />

          <Text
            style={[
              styles.gridLabel,
              {
                fontSize: POWER_FLOW_FONT_SIZE.grid.title * fontScale,
                lineHeight:
                  POWER_FLOW_FONT_SIZE.grid.titleLineHeight * fontScale,
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Grid
          </Text>

          <Text
            style={[
              styles.gridValue,
              {
                color: POWER_FLOW_COLORS.grid,
                fontSize: POWER_FLOW_FONT_SIZE.grid.value * fontScale,
                lineHeight:
                  POWER_FLOW_FONT_SIZE.grid.valueLineHeight * fontScale,
                transform: [
                  {
                    translateX:
                      POWER_FLOW_FONT_SIZE.grid.valueOffsetX * layoutScale,
                  },
                  {
                    translateY:
                      POWER_FLOW_FONT_SIZE.grid.valueOffsetY * layoutScale,
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
                  color: POWER_FLOW_COLORS.grid,
                  fontSize: POWER_FLOW_FONT_SIZE.grid.unit * fontScale,
                },
              ]}
            >
              kWh
            </Text>
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
          metricKey="battery"
          icon={
            <MaterialCommunityIcons
              name="battery-charging-high"
              size={34 * iconScale}
              color="#99E500"
            />
          }
          title={`Battery`}
          value={formatValue(batteryKwh)}
          color={POWER_FLOW_COLORS.battery}
          subtitle=""
          layoutScale={layoutScale}
          fontScale={fontScale}
          selected={selectedFlow === "battery"}
          onPress={selectFlow("battery")}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: POWER_FLOW_LAYOUT.containerPaddingTop,
    paddingBottom: POWER_FLOW_LAYOUT.containerPaddingBottom,
    paddingHorizontal: POWER_FLOW_LAYOUT.containerPaddingHorizontal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: POWER_FLOW_LAYOUT.containerMinHeight,
    marginBottom: 16,
    overflow: "visible",
    elevation: 5,
  },

  sideColumn: {
    width: POWER_FLOW_LAYOUT.sideColumnWidth,
    justifyContent: "space-between",
    gap: POWER_FLOW_LAYOUT.sideColumnGap,
  },

  metricBlock: {
    width: POWER_FLOW_LAYOUT.metricBlockWidth,
    height: POWER_FLOW_LAYOUT.metricBlockHeight,
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "visible",
  },

  metricIcon: {
    height: POWER_FLOW_LAYOUT.metricIconHeight,
    marginBottom: POWER_FLOW_LAYOUT.metricIconMarginBottom,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },

  flashWrap: {
    width: 40,
    height: 40,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  flashPlus: {
    position: "absolute",
    right: -2,
    bottom: 0,
  },

  metricTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
  },

  metricTitleSlot: {
    height: POWER_FLOW_LAYOUT.metricTitleHeight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  metricValueSlot: {
    height: POWER_FLOW_LAYOUT.metricValueHeight,
    marginTop: POWER_FLOW_LAYOUT.metricValueMarginTop,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  metricValue: {
    fontWeight: "800",
    textAlign: "center",
  },

  metricUnit: {
    fontWeight: "800",
  },

  metricSubtitle: {
    marginTop: 6,
    color: "#D7DDE6",
    fontSize: 7,
    lineHeight: 9,
    fontWeight: "600",
    textAlign: "center",
  },

  centerSection: {
    width: POWER_FLOW_LAYOUT.centerSectionWidth,
    alignItems: "center",
    justifyContent: "center",
  },

  ringWrapper: {
    width: POWER_FLOW_LAYOUT.ringSize,
    height: POWER_FLOW_LAYOUT.ringSize,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  centerContent: {
    position: "absolute",
    top: POWER_FLOW_LAYOUT.centerContentTop,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  centerLabel: {
    color: "#FFFFFF",
    fontSize: POWER_FLOW_FONT_SIZE.center.label,
    lineHeight: POWER_FLOW_FONT_SIZE.center.labelLineHeight,
    fontWeight: "350",
    textAlign: "center",
  },

  centerValue: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: POWER_FLOW_FONT_SIZE.center.value,
    lineHeight: POWER_FLOW_FONT_SIZE.center.valueLineHeight,
    fontWeight: "800",
    textAlign: "center",
  },

  centerUnit: {
    color: "#FFFFFF",
    fontSize: POWER_FLOW_FONT_SIZE.center.unit,
    fontWeight: "800",
  },

  gridBlock: {
    width: POWER_FLOW_LAYOUT.gridBlockWidth,
    height: POWER_FLOW_LAYOUT.gridBlockHeight,
    marginTop: POWER_FLOW_LAYOUT.gridBlockMarginTop,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  gridValue: {
    marginTop: 4,
    color: POWER_FLOW_COLORS.grid,
    fontSize: POWER_FLOW_FONT_SIZE.grid.value,
    lineHeight: POWER_FLOW_FONT_SIZE.grid.valueLineHeight,
    fontWeight: "800",
    textAlign: "center",
  },

  gridUnit: {
    fontSize: POWER_FLOW_FONT_SIZE.grid.unit,
    fontWeight: "800",
    color: POWER_FLOW_COLORS.grid,
  },

  gridLabel: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: POWER_FLOW_FONT_SIZE.grid.title,
    lineHeight: POWER_FLOW_FONT_SIZE.grid.titleLineHeight,
    fontWeight: "700",
    textAlign: "center",
  },
});
