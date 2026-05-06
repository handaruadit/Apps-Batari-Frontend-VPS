import React from "react";
import { StyleSheet, Text, View } from "react-native";
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
  containerPaddingHorizontal: 12,
  containerMinHeight: 240,
  sideColumnWidth: 76,
  sideColumnGap: 28,
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

function MetricBlock({ metricKey, icon, title, value, color, subtitle }) {
  const font =
    POWER_FLOW_FONT_SIZE[metricKey] || POWER_FLOW_FONT_SIZE.production;

  return (
    <View style={styles.metricBlock}>
      <View style={styles.metricIcon}>{icon}</View>

      <View style={styles.metricTitleSlot}>
        <Text
          style={[
            styles.metricTitle,
            { fontSize: font.title, lineHeight: font.titleLineHeight },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
      </View>

      <View
        style={[
          styles.metricValueSlot,
          {
            transform: [
              { translateX: font.valueOffsetX },
              { translateY: font.valueOffsetY },
            ],
          },
        ]}
      >
        <Text
          style={[
            styles.metricValue,
            {
              color,
              fontSize: font.value,
              lineHeight: font.valueLineHeight,
            },
          ]}
          numberOfLines={1}
        >
          {value}
          <Text style={[styles.metricUnit, { color, fontSize: font.unit }]}>
            kW
          </Text>
        </Text>
      </View>

      {!!subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );
}




export default function PowerFlowDiagram({ data = {} }) {
  const production = Number(data.production || 0);
  const grid = Number(data.grid || 0);
  const battery = Number(data.battery || 0);
  const upsLoad = Number(data.upsLoad || 0);
  const load = Number(data.load || 0);

  const totalConsumed = upsLoad + load;

  return (
    <View style={styles.container}>
      <View style={styles.sideColumn}>
        <MetricBlock
          metricKey="production"
          icon={
            <View style={styles.flashWrap}>
              <Ionicons name="flash" size={38} color="#1FB7FF" />
              <Ionicons
                name="add"
                size={14}
                color="#1FB7FF"
                style={styles.flashPlus}
              />
            </View>
          }
          title={"Production"}
          value={formatValue(production)}
          color="#1FB7FF"
          subtitle=""
        />

        <MetricBlock
          metricKey="load"
          icon={
            <View style={{ marginTop: 6 }}>
              <MaterialCommunityIcons
                name="solar-panel"
                size={34}
                color="#FF4646"
              />
            </View>
          }
          title={"Load"}
          value={formatValue(load)}
          color="#FF4646"
          subtitle=""
        />
      </View>

      <View style={styles.centerSection}>
        <View style={styles.ringWrapper}>
          <Svg width={238} height={238} viewBox="0 0 238 238">
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

          <View style={styles.centerContent}>
            <Text style={styles.centerLabel}>TOTAL</Text>
            <Text style={styles.centerValue}>
              {formatValue(totalConsumed)}
              <Text style={styles.centerUnit}>kW</Text>
            </Text>
          </View>
        </View>

        <View style={styles.upsLoadBlock}>
          <MaterialCommunityIcons
            name="transmission-tower"
            size={POWER_FLOW_LAYOUT.upsLoadIconSize}
            color="#FFD54A"
            style={{ marginBottom: POWER_FLOW_LAYOUT.upsLoadIconMarginBottom }}
          />
          <Text style={styles.upsLoadLabel}>Ups-Load</Text>
          <Text
            style={[
              styles.upsLoadValue,
              {
                transform: [
                  { translateX: POWER_FLOW_FONT_SIZE.upsLoad.valueOffsetX },
                  { translateY: POWER_FLOW_FONT_SIZE.upsLoad.valueOffsetY },
                ],
              },
            ]}
          >
            {formatValue(upsLoad)}
            <Text style={styles.upsLoadUnit}>kW</Text>
          </Text>
        </View>
      </View>

      <View style={styles.sideColumn}>
        <MetricBlock
          metricKey="battery"
          icon={
            <MaterialCommunityIcons
              name="battery-charging-high"
              size={34}
              color="#99E500"
            />
          }
          title={`Battery`}
          value={formatValue(battery)}
          color="#99E500"
          subtitle=""
        />

        <MetricBlock
          metricKey="grid"
          icon={
            <FontAwesome5 name="broadcast-tower" size={28} color="#FF9300" />
          }
          title={"Grid"}
          value={formatValue(grid)}
          color="#FF9300"
          subtitle=""
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
