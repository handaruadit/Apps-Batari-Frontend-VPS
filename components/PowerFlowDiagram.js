import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
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
  upsLoadBlockWidth: 108,
  upsLoadBlockHeight: 78,
  upsLoadMarginTop: 12,
  upsLoadIconSize: 40,
  upsLoadIconMarginBottom: 4,
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
  load: {
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
  upsLoad: {
    title: 12,
    titleLineHeight: 12,
    value: 20,
    valueLineHeight: 25,
    unit: 10,
    valueOffsetX: 0,
    valueOffsetY: 0,
  },
  center: {
    label: 28,
    labelLineHeight: 40,
    value: 30,
    valueLineHeight: 32,
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

function MetricBlock({
  metricKey,
  icon,
  title,
  value,
  color,
  subtitle,
  layoutScale,
  fontScale,
}) {
  const font =
    POWER_FLOW_FONT_SIZE[metricKey] || POWER_FLOW_FONT_SIZE.production;

  return (
    <View
      style={[
        styles.metricBlock,
        {
          width: scaleValue(POWER_FLOW_LAYOUT.metricBlockWidth, layoutScale),
          height: scaleValue(POWER_FLOW_LAYOUT.metricBlockHeight, layoutScale),
        },
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
    </View>
  );
}

export default function PowerFlowDiagram({ data = {} }) {
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

  return (
    <View
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
              <Ionicons name="flash" size={38 * iconScale} color="#1FB7FF" />
              <Ionicons
                name="add"
                size={14 * iconScale}
                color="#1FB7FF"
                style={styles.flashPlus}
              />
            </View>
          }
          title={"Consumption"}
          value={formatValue(consumptionKwh)}
          color="#1FB7FF"
          subtitle=""
          layoutScale={layoutScale}
          fontScale={fontScale}
        />

        {/* <MetricBlock
          metricKey="load"
          icon={
            <View style={{ marginTop: 6 }}>
              <MaterialCommunityIcons
                name="solar-panel"
                size={34 * iconScale}
                color="#FF4646"
              />
            </View>
          }
          title={"Load"}
          value={formatValue(load)}
          color="#FF4646"
          subtitle=""
          layoutScale={layoutScale}
          fontScale={fontScale}
        /> */}
      </View>

      <View style={[styles.centerSection, { width: centerSectionWidth }]}>
        <View
          style={[styles.ringWrapper, { width: ringSize, height: ringSize }]}
        >
          <Svg width={ringSize} height={ringSize} viewBox="0 0 238 238">
            <Circle
              cx="119"
              cy="119"
              r="76"
              stroke="#FF3B3B"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="120 480"
              transform="rotate(180 119 119)"
            />

            <Circle
              cx="119"
              cy="119"
              r="76"
              stroke="#1FB7FF"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="112 477"
              transform="rotate(-90 119 119)"
            />

            <Circle
              cx="119"
              cy="119"
              r="76"
              stroke="#99E500"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="112 477"
              transform="rotate(0 119 119)"
            />

            <Circle
              cx="119"
              cy="119"
              r="76"
              stroke="#FF9300"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="112 477"
              transform="rotate(90 119 119)"
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
            >
              TOTAL
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

        {/* <View
          style={[
            styles.upsLoadBlock,
            {
              width: scaleValue(POWER_FLOW_LAYOUT.upsLoadBlockWidth, layoutScale),
              height: scaleValue(
                POWER_FLOW_LAYOUT.upsLoadBlockHeight,
                layoutScale,
              ),
              marginTop: scaleValue(
                POWER_FLOW_LAYOUT.upsLoadMarginTop,
                layoutScale,
              ),
            },
          ]}
        >
          <MaterialCommunityIcons
            name="transmission-tower"
            size={POWER_FLOW_LAYOUT.upsLoadIconSize * iconScale}
            color="#FFD54A"
            style={{
              marginBottom: scaleValue(
                POWER_FLOW_LAYOUT.upsLoadIconMarginBottom,
                layoutScale,
              ),
            }}
          />
          <Text
            style={[
              styles.upsLoadLabel,
              {
                fontSize: POWER_FLOW_FONT_SIZE.upsLoad.title * fontScale,
                lineHeight:
                  POWER_FLOW_FONT_SIZE.upsLoad.titleLineHeight * fontScale,
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Ups-Load
          </Text>
          <Text
            style={[
              styles.upsLoadValue,
              {
                fontSize: POWER_FLOW_FONT_SIZE.upsLoad.value * fontScale,
                lineHeight:
                  POWER_FLOW_FONT_SIZE.upsLoad.valueLineHeight * fontScale,
                transform: [
                  {
                    translateX:
                      POWER_FLOW_FONT_SIZE.upsLoad.valueOffsetX * layoutScale,
                  },
                  {
                    translateY:
                      POWER_FLOW_FONT_SIZE.upsLoad.valueOffsetY * layoutScale,
                  },
                ],
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatValue(upsLoad)}
            <Text
              style={[
                styles.upsLoadUnit,
                { fontSize: POWER_FLOW_FONT_SIZE.upsLoad.unit * fontScale },
              ]}
            >
              kW
            </Text>
          </Text>
        </View> */}
        <View
          style={[
            styles.upsLoadBlock,
            {
              width: scaleValue(
                POWER_FLOW_LAYOUT.upsLoadBlockWidth,
                layoutScale,
              ),
              height: scaleValue(
                POWER_FLOW_LAYOUT.upsLoadBlockHeight,
                layoutScale,
              ),
              marginTop: scaleValue(
                POWER_FLOW_LAYOUT.upsLoadMarginTop,
                layoutScale,
              ),
            },
          ]}
        >
          <FontAwesome5
            name="broadcast-tower"
            size={28 * iconScale}
            color="#FF9300"
            style={{
              marginBottom: scaleValue(
                POWER_FLOW_LAYOUT.upsLoadIconMarginBottom,
                layoutScale,
              ),
            }}
          />

          <Text
            style={[
              styles.upsLoadLabel,
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
              styles.upsLoadValue,
              {
                color: "#FF9300",
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
                styles.upsLoadUnit,
                {
                  color: "#FF9300",
                  fontSize: POWER_FLOW_FONT_SIZE.grid.unit * fontScale,
                },
              ]}
            >
              kWh
            </Text>
          </Text>
        </View>
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
          color="#99E500"
          subtitle=""
          layoutScale={layoutScale}
          fontScale={fontScale}
        />

        
      </View>
    </View>
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

  metricBlockLeft: {
    alignItems: "center",
  },

  metricBlockRight: {
    alignItems: "center",
    marginRight: 0,
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

  textLeft: {
    textAlign: "left",
  },

  textRight: {
    textAlign: "right",
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

  upsLoadBlock: {
    width: POWER_FLOW_LAYOUT.upsLoadBlockWidth,
    height: POWER_FLOW_LAYOUT.upsLoadBlockHeight,
    marginTop: POWER_FLOW_LAYOUT.upsLoadMarginTop,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  upsLoadValue: {
    marginTop: 4,
    color: "#FFD54A",
    fontSize: POWER_FLOW_FONT_SIZE.upsLoad.value,
    lineHeight: POWER_FLOW_FONT_SIZE.upsLoad.valueLineHeight,
    fontWeight: "800",
    textAlign: "center",
  },

  upsLoadUnit: {
    fontSize: POWER_FLOW_FONT_SIZE.upsLoad.unit,
    fontWeight: "800",
    color: "#FFD54A",
  },

  upsLoadLabel: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: POWER_FLOW_FONT_SIZE.upsLoad.title,
    lineHeight: POWER_FLOW_FONT_SIZE.upsLoad.titleLineHeight,
    fontWeight: "700",
    textAlign: "center",
  },
});
